import { RegularPolygon } from './js/regularPolygon.js';
import { Pacman } from './js/pacman.js';
import { Segment } from './js/segment.js';
import { Point } from './js/point.js';
import { Polygon } from './js/polygon.js';

const canvasCanvas = document.getElementById('canvasCanvas');
const canvasFps = document.getElementById('canvasFps');

const pixiCanvas = document.getElementById('pixiCanvas');
const pixiFps = document.getElementById('pixiFps');

const pixiBlue = 0x0000ff;
const pixiGreen = 0x00ff00;
const pixiWhite = 0xffffff;
const pixiBackground = 0x1e1e1e;
const canvasBlue = '#00f';
const canvasGreen = '#0f0';
const canvasWhite = '#fff';
const canvasBackground = '#1e1e1e';
const justABigNumber = 1000000;

const app = new PIXI.Application({
    view: pixiCanvas,
    width: canvasCanvas.width,
    height: canvasCanvas.height,
    backgroundColor: pixiBackground,
    antialias: true,
});

let canvasRect = canvasCanvas.getBoundingClientRect();
let pixiRect = pixiCanvas.getBoundingClientRect();

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

const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);
app.ticker.add(updatePixi, PIXI.UPDATE_PRIORITY.LOW);
app.ticker.start();

const p5Fps = document.getElementById('p5Fps');
let p5Rect;
new p5(function (p5context) {
    p5context.setup = function setup() {
        p5context.createCanvas(canvasCanvas.width, canvasCanvas.height).parent('p5Parent');
        p5Rect = p5context.canvas.getBoundingClientRect();
        p5context.canvas.addEventListener('mousemove', event =>
            mouse = new Point(event.clientX - p5Rect.left, event.clientY - p5Rect.top));
    }

    p5context.draw = function updateP5() {
        if (pause) return;
        if (mouse.x > canvasCanvas.width) return;
        if (mouse.y > canvasCanvas.height) return;

        const rays = getRays();

        p5context
            .clear()
            .background(canvasBackground)
            .noFill();

        p5context.stroke(canvasBlue);
        if (!wireFrame) {
            p5context.fill(canvasBlue);
        }
        polygons.forEach(polygon => {
            p5context.beginShape();
            polygon.points.forEach(point => p5context.vertex(point.x, point.y));
            p5context.endShape(p5context.CLOSE);
        });

        p5context.stroke(canvasWhite);
        if (!wireFrame) {
            p5context.fill(canvasWhite);
        }
        for (var i = 0; i < rays.length; i++) {
            const ray = rays[i];

            if (!wireFrame) {
                const nextRay = rays[i + 1] || rays[0];
    
                p5context.fill(pixiWhite);
                p5context.beginShape();
                [mouse, ray.point2, nextRay.point2].forEach(point => p5context.vertex(point.x, point.y));
                p5context.endShape(p5context.CLOSE);
            }
            else {
                p5context.line(ray.point1.x, ray.point1.y, ray.point2.x, ray.point2.y);
            }
        }

        p5context.stroke(canvasGreen);
        if (!wireFrame) {
            p5context.fill(canvasGreen);
        }
        p5context.circle(mouse.x, mouse.y, 20);

        p5Fps.innerText = p5context.frameRate().toFixed(0);
    };
});

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

    graphics
        .clear()
        .lineStyle(1, pixiBlue);

    if (!wireFrame) {
        graphics.beginFill(pixiBlue);
    }

    polygons.forEach(polygon => graphics.drawPolygon(polygon.points));

    graphics.lineStyle(1, pixiWhite);

    for (var i = 0; i < rays.length; i++) {
        const ray = rays[i];

        if (!wireFrame) {
            const nextRay = rays[i + 1] || rays[0];

            graphics
                .beginFill(pixiWhite)
                .drawPolygon([mouse, ray.point2, nextRay.point2]);
        }
        else {
            graphics
                .moveTo(ray.point1.x, ray.point1.y)
                .lineTo(ray.point2.x, ray.point2.y);
        }
    }

    if (!wireFrame) {
        graphics.beginFill(pixiGreen);
    }

    graphics
        .lineStyle(1, pixiGreen)
        .drawCircle(mouse.x, mouse.y, 10);

    if (!wireFrame) {
        graphics.endFill();
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