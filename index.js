import { RegularPolygon } from './js/regularPolygon.js';
import { Pacman } from './js/pacman.js';
import { Segment } from './js/segment.js';
import { Point } from './js/point.js';
import { Polygon } from './js/polygon.js';

const width = 600;
const height = 600;

const blue = '#00f';
const green = '#0f0';
const white = '#fff';
const background = '#1e1e1e';
const justABigNumber = 1000000;

const corners = new Polygon([new Point(0, 0), new Point(width, 0), new Point(width, height), new Point(0, height)]);
const triangle = new RegularPolygon(3).scale(75).translate(150, 150);
const square = new RegularPolygon(4).scale(75).translate(450, 150);
const pentagon = new RegularPolygon(5).scale(75).translate(150, 450);
const circle = new RegularPolygon(60).scale(75).translate(450, 450);
const pacman = new Pacman().scale(75).translate(300, 300);

const polygons = [triangle, square, pentagon, circle, pacman];
const polygonSegments = [];

polygons.forEach(polygon => polygonSegments.push(...polygon.segments()));

let pause = false;
let filled = true;
let mouse = new Point(1, 1);
let canvasLastTime = performance.now();

window.addEventListener('keydown', event => {
    if (event.key.toLowerCase() == 'p') pause = !pause;
    if (event.key.toLowerCase() == 'f') filled = !filled;
});

(function startCanvas() {
    const canvas = document.getElementById('canvasCanvas');
    const fps = document.getElementById('canvasFps');

    let rect = canvas.getBoundingClientRect();
    canvas.addEventListener('mousemove', event => mouse = new Point(event.clientX - rect.left, event.clientY - rect.top));
    window.addEventListener('resize', () => rect = canvas.getBoundingClientRect());

    const context = canvas.getContext('2d');
    update(); // kick start for requestAnimationFrame

    function update() {
        requestAnimationFrame(update);

        if (pause) return;
        if (mouse.x > canvas.width) return;
        if (mouse.y > canvas.height) return;

        const rays = getRays();

        context.fillStyle = canvas.style.borderColor;
        context.rect(0, 0, canvas.width, canvas.height);
        context.fill();

        polygons.forEach(polygon => {
            context.fillStyle = blue;
            context.strokeStyle = context.fillStyle;
            context.beginPath();
            context.moveTo(polygon.points[0].x, polygon.points[0].y);

            polygon.points.forEach(point => context.lineTo(point.x, point.y));

            context.closePath();

            if (filled) {
                context.fill();
            }

            context.stroke();
        });

        for (let i = 0; i < rays.length; i++) {
            context.fillStyle = white;
            context.strokeStyle = context.fillStyle;
            context.beginPath();
            context.moveTo(mouse.x, mouse.y);
            context.lineTo(rays[i].point2.x, rays[i].point2.y);

            if (filled) {
                const nextRay = rays[i + 1] || rays[0];

                context.lineTo(nextRay.point2.x, nextRay.point2.y);
                context.closePath();
                context.fill();
            }

            context.stroke();
        }

        context.fillStyle = green;
        context.strokeStyle = context.fillStyle;
        context.beginPath();
        context.ellipse(mouse.x, mouse.y, 10, 10, 0, Math.PI * 2, false);

        if (filled) {
            context.fill();
        }

        context.stroke();

        const now = performance.now();
        fps.innerHTML = Math.round(1000 / (now - canvasLastTime)).toFixed(0);
        canvasLastTime = now;
    }
})();

(function startPixi() {
    // pixi uses binary color values
    const blue = 0x0000ff;
    const green = 0x00ff00;
    const white = 0xffffff;
    const background = 0x1e1e1e;

    const canvas = document.getElementById('pixiCanvas');
    const fps = document.getElementById('pixiFps');

    let rect = canvas.getBoundingClientRect();
    canvas.addEventListener('mousemove', event => mouse = new Point(event.clientX - rect.left, event.clientY - rect.top));
    window.addEventListener('resize', () => rect = canvas.getBoundingClientRect());

    const graphics = new PIXI.Graphics();
    const app = new PIXI.Application({
        view: canvas,
        width: canvas.width,
        height: canvas.height,
        backgroundColor: background,
        antialias: true,
    });
    app.stage.addChild(graphics);
    app.ticker.add(update, PIXI.UPDATE_PRIORITY.LOW);
    app.ticker.start();

    function update() {
        if (pause) return;
        if (mouse.x > canvas.width) return;
        if (mouse.y > canvas.height) return;

        const rays = getRays();

        graphics
            .clear()
            .lineStyle(1, blue);

        if (filled) {
            graphics.beginFill(blue);
        }

        polygons.forEach(polygon => graphics.drawPolygon(polygon.points));

        graphics.lineStyle(1, white);

        for (var i = 0; i < rays.length; i++) {
            const ray = rays[i];

            if (filled) {
                const nextRay = rays[i + 1] || rays[0];

                graphics
                    .beginFill(white)
                    .drawPolygon([mouse, ray.point2, nextRay.point2]);
            }
            else {
                graphics
                    .moveTo(ray.point1.x, ray.point1.y)
                    .lineTo(ray.point2.x, ray.point2.y);
            }
        }

        if (filled) {
            graphics.beginFill(green);
        }

        graphics
            .lineStyle(1, green)
            .drawCircle(mouse.x, mouse.y, 10);

        if (filled) {
            graphics.endFill();
        }

        fps.innerHTML = app.ticker.FPS.toFixed(0);
    }
}());

(function startP5() {
    let canvas;
    const fps = document.getElementById('p5Fps');

    new p5(function (p5context) {
        p5context.setup = function setup() {
            p5context
                .createCanvas(width, height)
                .parent('p5Canvas');

            canvas = p5context.canvas;

            canvas.style.border = '1px solid ' + background;

            let p5Rect = canvas.getBoundingClientRect();
            canvas.addEventListener('mousemove', event => mouse = new Point(event.clientX - p5Rect.left, event.clientY - p5Rect.top));
            window.addEventListener('resize', () => p5Rect = canvas.getBoundingClientRect());
        }

        p5context.draw = function update() {
            if (pause) return;
            if (mouse.x > canvas.width) return;
            if (mouse.y > canvas.height) return;

            const rays = getRays();

            p5context
                .clear()
                .background(background)
                .noFill();

            p5context.stroke(blue);

            if (filled) {
                p5context.fill(blue);
            }

            polygons.forEach(polygon => {
                p5context.beginShape();
                polygon.points.forEach(point => p5context.vertex(point.x, point.y));
                p5context.endShape(p5context.CLOSE);
            });

            p5context.stroke(white);

            if (filled) {
                p5context.fill(white);
            }

            for (var i = 0; i < rays.length; i++) {
                const ray = rays[i];

                if (filled) {
                    const nextRay = rays[i + 1] || rays[0];

                    p5context.fill(white);
                    p5context.beginShape();
                    [mouse, ray.point2, nextRay.point2].forEach(point => p5context.vertex(point.x, point.y));
                    p5context.endShape(p5context.CLOSE);
                }
                else {
                    p5context.line(ray.point1.x, ray.point1.y, ray.point2.x, ray.point2.y);
                }
            }

            p5context.stroke(green);
            
            if (filled) {
                p5context.fill(green);
            }

            p5context.circle(mouse.x, mouse.y, 20);

            fps.innerText = p5context.frameRate().toFixed(0);
        };
    });
}());

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

    return rays.sort((a, b) => a.angle() - b.angle());
}