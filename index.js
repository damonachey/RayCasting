import { RegularPolygon } from './js/regularPolygon.js';
import { Pacman } from './js/pacman.js';
import { Segment } from './js/segment.js';
import { Point } from './js/point.js';
import { Polygon } from './js/polygon.js';

const canvasCanvas = document.getElementById('canvasCanvas');
const canvasFps = document.getElementById('canvasFps');

const pixiCanvas = document.getElementById('pixiCanvas');
const pixiFps = document.getElementById('pixiFps');

const p5Canvas = document.getElementById('p5Canvas');
const p5Fps = document.getElementById('p5Fps');

const app = new PIXI.Application({
    view: pixiCanvas,
    width: canvasCanvas.width,
    height: canvasCanvas.height,
    backgroundColor: 0x1e1e1e,
    antialias: true,
});

let canvasRect = canvasCanvas.getBoundingClientRect();
let pixiRect = pixiCanvas.getBoundingClientRect();
let p5Rect = p5Canvas.getBoundingClientRect();

const pixiBlue = 0x0000ff;
const pixiGreen = 0x00ff00;
const pixiWhite = 0xffffff;
const canvasBlue = '#00f';
const canvasGreen = '#0f0';
const canvasWhite = '#fff';
const justABigNumber = 1000000;

let pause = false;
let wireFrame = false;
let mouse = new Point(1, 1);
let canvasLastTime = performance.now();

window.addEventListener('resize', event => {
    canvasRect = canvasCanvas.getBoundingClientRect();
    pixiRect = pixiCanvas.getBoundingClientRect();
    p5Rect = p5Canvas.getBoundingClientRect();
});

window.addEventListener('keydown', event => {
    if (event.key == 'p') pause = !pause;
    if (event.key == 'w') wireFrame = !wireFrame;
});

canvasCanvas.addEventListener('mousemove', event => 
    mouse = new Point(event.clientX - canvasRect.left, event.clientY - canvasRect.top));

pixiCanvas.addEventListener('mousemove', event =>
    mouse = new Point(event.clientX - pixiRect.left, event.clientY - pixiRect.top));

p5Canvas.addEventListener('mousemove', event =>
    mouse = new Point(event.clientX - p5Rect.left, event.clientY - p5Rect.top));

const corners = new Polygon([new Point(0, 0), new Point(canvasCanvas.width, 0), new Point(canvasCanvas.width, canvasCanvas.height), new Point(0, canvasCanvas.height)]);
const triangle = new RegularPolygon(3).scale(75).translate(150, 150);
const square = new RegularPolygon(4).scale(75).translate(450, 150);
const pentagon = new RegularPolygon(5).scale(75).translate(150, 450);
const circle = new RegularPolygon(60).scale(75).translate(450, 450);
const pacman = new Pacman().scale(75).translate(300, 300);

const polygons = [triangle, square, pentagon, circle, pacman];
const polygonSegments = [];

polygons.forEach(polygon => polygonSegments.push(...polygon.segments()));

const ctx = canvasCanvas.getContext('2d');
updateCanvas();

const g = new PIXI.Graphics();
app.stage.addChild(g);
app.ticker.add(updatePixi, PIXI.UPDATE_PRIORITY.LOW);
app.ticker.start();

function updateCanvas() {
    requestAnimationFrame(updateCanvas);

    if (pause) return;
    if (mouse.x > canvasCanvas.width) return;
    if (mouse.y > canvasCanvas.height) return;

    const rays = getRays(mouse);

    ctx.fillStyle = canvasCanvas.style.borderColor;
    ctx.rect(0, 0, canvasCanvas.width, canvasCanvas.height);
    ctx.fill();

    // draw polygons
    polygons.forEach(polygon => {
        ctx.fillStyle = canvasBlue;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.beginPath();
        ctx.moveTo(polygon.points[0].x, polygon.points[0].y);

        polygon.points.forEach(point => ctx.lineTo(point.x, point.y));

        ctx.closePath();

        if (!wireFrame) {
            ctx.fill();
        }

        ctx.stroke();
    });

    // draw rays in order as lines or filled
    for (let i = 0; i < rays.length; i++) {
        ctx.fillStyle = canvasWhite;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(rays[i].point2.x, rays[i].point2.y);

        if (!wireFrame) {
            const nextRay = rays[i + 1] || rays[0];

            ctx.lineTo(nextRay.point2.x, nextRay.point2.y);
            ctx.closePath();
            ctx.fill();
        }

        ctx.stroke();
    }

    // draw light circle at mouse
    ctx.fillStyle = canvasGreen;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.ellipse(mouse.x, mouse.y, 10, 10, 0, Math.PI * 2, false);
    if (!wireFrame) ctx.fill();
    ctx.stroke();

    const now = performance.now();
    canvasFps.innerHTML = Math.round(1000 / (now - canvasLastTime)).toFixed(0);
    canvasLastTime = now;
}

function updatePixi() {
    if (pause) return;
    if (mouse.x > canvasCanvas.width) return;
    if (mouse.y > canvasCanvas.height) return;

    const rays = getRays();

    g.clear();
    g.lineStyle(1, pixiBlue);

    if (!wireFrame) {
        g.beginFill(pixiBlue);
    }

    polygons.forEach(polygon => polygon.draw(g));

    g.lineStyle(1, pixiWhite);

    if (!wireFrame) {
        g.beginFill(pixiWhite);

        for (var i = 0; i < rays.length; i++) {
            const ray = rays[i];
            const nextRay = rays[i + 1] || rays[0];

            g.drawPolygon([mouse, ray.point2, nextRay.point2]);
        }
    }
    else {
        rays.forEach(ray => ray.draw(g));
    }

    if (!wireFrame) {
        g.beginFill(pixiGreen);
    }

    g.lineStyle(1, pixiGreen);
    g.drawCircle(mouse.x, mouse.y, 10);

    if (!wireFrame) {
        g.endFill();
    }

    pixiFps.innerHTML = app.ticker.FPS.toFixed(0);
}

function getRays() {
    const polygonPoints = [...corners.points];

    polygons.forEach(polygon => polygon.points.forEach(point => {
        polygonPoints.push(point.rotate(1 / justABigNumber, mouse));
        polygonPoints.push(point.rotate(-1 / justABigNumber, mouse));
    }));

    const rays = [];

    polygonPoints.forEach(point => {
        const ray = new Segment(mouse, point).extend(justABigNumber);
        let shortest = ray;

        polygonSegments.forEach(segment => {
            const intersection = segment.intersection(ray);

            if (intersection) {
                if (mouse.distance(intersection) < shortest.length()) {
                    shortest = new Segment(mouse, intersection);
                }
            }
        });

        rays.push(shortest);
    });

    rays.sort((a, b) => a.angle() - b.angle());

    return rays;
}
