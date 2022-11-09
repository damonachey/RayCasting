import { RegularPolygon } from './js/regularPolygon.js';
import { Pacman } from './js/pacman.js';
import { Segment } from './js/segment.js';
import { Point } from './js/point.js';
import { Polygon } from './js/polygon.js';

const width = 600;
const height = 600;

const blue = '#0000ff';
const green = '#00ff00';
const white = '#ffffff';
const background = '#1e1e1e';
const justABigNumber = 1000000;

const corners = new Polygon([new Point(0, 0), new Point(width, 0), new Point(width, height), new Point(0, height)]);
const triangle = new RegularPolygon(3).scale(75).translate(150, 150);
const square = new RegularPolygon(4).scale(75).translate(450, 150);
const pentagon = new RegularPolygon(5).scale(75).translate(150, 450);
const circle = new RegularPolygon(60).scale(75).translate(450, 450);
const pacman = new Pacman().scale(75).translate(300, 300);

const polygons = [triangle, square, pentagon, circle, pacman];
const polygonSegments = polygons.flatMap(polygon => polygon.segments());

function getRays(mouse) {
    const getPointsBothSides = point => [
        point.rotate(1 / justABigNumber, mouse),
        point.rotate(-1 / justABigNumber, mouse),
    ];

    const getRayFromMouseThroughPoint = point => new Segment(mouse, point).extend(justABigNumber);

    const getShortestCastRay = ray => polygonSegments
        .map(segment => segment.intersection(ray) || ray.point2)
        .map(point => new Segment(mouse, point))
        .reduce((shortest, ray) => ray.length() < shortest.length() ? ray : shortest, ray);

    return polygons
        .flatMap(polygon => polygon.points)
        .flatMap(getPointsBothSides)
        .concat(corners.points)
        .map(getRayFromMouseThroughPoint)
        .map(getShortestCastRay)
        .sort((a, b) => a.angle() - b.angle());
}

let pause = false;
let filled = true;
let mouse = new Point(1, 1);

window.addEventListener('keydown', event => {
    if (event.key.toLowerCase() == 'p') pause = !pause;
    if (event.key.toLowerCase() == 'f') filled = !filled;
});

(function startCanvas() {
    const canvas = document.getElementById('canvasCanvas');
    const fps = document.getElementById('canvasFps');

    let lastTime = performance.now();
    canvas.addEventListener('mousemove', event => 
    {
        const rect = canvas.getBoundingClientRect();
        mouse = new Point(event.clientX - rect.left, event.clientY - rect.top);
    });

    const context = canvas.getContext('2d');
    update(); // kick start for requestAnimationFrame

    function update() {
        requestAnimationFrame(update);

        if (pause) return;
        if (mouse.x > canvas.width) return;
        if (mouse.y > canvas.height) return;

        const rays = getRays(mouse);

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
        fps.innerText = Math.round(1000 / (now - lastTime)).toFixed(0);
        lastTime = now;
    }
})();

(function startPixi() {
    const canvas = document.getElementById('pixiCanvas');
    const fps = document.getElementById('pixiFps');

    canvas.addEventListener('mousemove', event => {
        const rect = canvas.getBoundingClientRect();
        mouse = new Point(event.clientX - rect.left, event.clientY - rect.top); 
    });

    const graphics = new PIXI.Graphics();
    const app = new PIXI.Application({
        view: canvas,
        width: canvas.width,
        height: canvas.height,
        backgroundColor: PIXI.utils.string2hex(background),
        antialias: true,
    });
    app.stage.addChild(graphics);
    app.ticker.add(update, PIXI.UPDATE_PRIORITY.LOW);
    app.ticker.start();

    function setColor(color) {
        const hex = PIXI.utils.string2hex(color);

        graphics.lineStyle(1, hex);

        if (filled) {
            graphics.beginFill(hex);
        }
    }

    function update() {
        if (pause) return;
        if (mouse.x > canvas.width) return;
        if (mouse.y > canvas.height) return;

        const rays = getRays(mouse);

        graphics.clear();

        setColor(blue);

        polygons.forEach(polygon => graphics.drawPolygon(polygon.points));

        setColor(white);

        for (var i = 0; i < rays.length; i++) {
            const ray = rays[i];

            if (filled) {
                const nextRay = rays[i + 1] || rays[0];
                const rayPolygon = new Polygon([mouse, ray.point2, nextRay.point2]);

                graphics.drawPolygon(rayPolygon.points);
            }
            else {
                graphics
                    .moveTo(ray.point1.x, ray.point1.y)
                    .lineTo(ray.point2.x, ray.point2.y);
            }
        }

        setColor(green);

        graphics.drawCircle(mouse.x, mouse.y, 10);

        if (filled) {
            graphics.endFill();
        }

        fps.innerText = app.ticker.FPS.toFixed(0);
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

            canvas.addEventListener('mousemove', event => {
                const rect = canvas.getBoundingClientRect();
                mouse = new Point(event.clientX - rect.left, event.clientY - rect.top);
            });
        }

        function setColor(color) {
            p5context.stroke(color);

            if (filled) {
                p5context.fill(color);
            }
        }

        p5context.draw = function update() {
            if (pause) return;
            if (mouse.x > canvas.width) return;
            if (mouse.y > canvas.height) return;

            const rays = getRays(mouse);

            p5context
                .clear()
                .background(background)
                .noFill();

            setColor(blue);

            polygons.forEach(polygon => {
                p5context.beginShape();
                polygon.points.forEach(point => p5context.vertex(point.x, point.y));
                p5context.endShape(p5context.CLOSE);
            });

            setColor(white);

            for (var i = 0; i < rays.length; i++) {
                const ray = rays[i];

                if (filled) {
                    const nextRay = rays[i + 1] || rays[0];
                    const rayPolygon = new Polygon([mouse, ray.point2, nextRay.point2]);

                    p5context.beginShape();
                    rayPolygon.points.forEach(point => p5context.vertex(point.x, point.y));
                    p5context.endShape(p5context.CLOSE);
                }
                else {
                    p5context.line(ray.point1.x, ray.point1.y, ray.point2.x, ray.point2.y);
                }
            }

            setColor(green);

            p5context.circle(mouse.x, mouse.y, 20);

            fps.innerText = p5context.frameRate().toFixed(0);
        };
    });
}());
