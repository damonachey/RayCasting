import { RegularPolygon } from './js/regularPolygon.js';
import { Pacman } from './js/pacman.js';
import { Segment } from './js/segment.js';
import { Point } from './js/point.js';
import { Polygon } from './js/polygon.js';

const canvas = document.getElementById('canvas');
const fps = document.getElementById('fps');
const app = new PIXI.Application({
    view: canvas,
    width: 800,
    height: 800,
    backgroundColor: 0x1e1e1e,
    antialias: true,
});

const blue = 0x0000ff;
const green = 0x00ff00;
const white = 0xffffff;
const justABigNumber = 1000000;

let pause = false;
let wireFrame = false;
let mouse = new Point(1, 1);

window.addEventListener('keydown', event => {
    if (event.key == 'p') pause = !pause;
    if (event.key == 'w') wireFrame = !wireFrame;
});

canvas.addEventListener('mousemove', event =>
    mouse = new Point(event.clientX - event.currentTarget.offsetLeft, event.clientY - event.currentTarget.offsetTop));

const corners = new Polygon([new Point(0, 0), new Point(canvas.width, 0), new Point(canvas.width, canvas.height), new Point(0, canvas.height)]);
const triangle = new RegularPolygon(3).scale(100).translate(200, 200);
const square = new RegularPolygon(4).scale(100).translate(600, 200);
const pentagon = new RegularPolygon(5).scale(100).translate(200, 600);
const circle = new RegularPolygon(60).scale(100).translate(600, 600);
const pacman = new Pacman().scale(100).translate(400, 400);

const polygons = [triangle, square, pentagon, circle, pacman];
const polygonSegments = [];

polygons.forEach(polygon => polygonSegments.push(...polygon.getSegments()));

const g = new PIXI.Graphics();
app.stage.addChild(g);
app.ticker.add(update, PIXI.UPDATE_PRIORITY.LOW);
app.ticker.start();

function update() {
    if (pause) return;
    if (mouse.x > canvas.width) return;
    if (mouse.y > canvas.height) return;

    const rays = getRays();

    g.clear();
    g.lineStyle(1, blue);

    if (!wireFrame) {
        g.beginFill(blue);
    }

    polygons.forEach(polygon => polygon.draw(g));

    g.lineStyle(1, white);

    if (!wireFrame) {
        g.beginFill(white);

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
        g.beginFill(green);
    }

    g.lineStyle(1, green);
    g.drawCircle(mouse.x, mouse.y, 10);

    if (!wireFrame) {
        g.endFill();
    }

    fps.innerHTML = app.ticker.FPS.toFixed(0);
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
