import { RegularPolygon } from './js/regularPolygon.js';
import { Pacman } from './js/pacman.js';
import { Segment } from './js/segment.js';

const view = document.getElementById('view');
const app = new PIXI.Application({
    view: view,
    width: 800,
    height: 800,
    backgroundColor: 0x1e1e1e,
    antialias: true,
});

const justABigNumber = 1000000;

let pause = false;
let wireFrame = false;
let mouse = { x: 0, y: 0 };

window.addEventListener('keydown', function (event) {
    if (event.key == 'p') pause = !pause;
    if (event.key == 'w') wireFrame = !wireFrame;
});

view.addEventListener('mousemove', function (event) {
    mouse = { x: event.clientX, y: event.clientY };
});

const g = new PIXI.Graphics();
app.stage.addChild(g);

const color = 0x0000ff;

const corners = { points: [{ x: 0, y: 0 }, { x: view.width, y: 0 }, { x: view.width, y: view.height }, { x: 0, y: view.height }] };
const light = new RegularPolygon(10).scale(10);

const triangle = new RegularPolygon(3).scale(100).translate(200, 200);
const square = new RegularPolygon(4).scale(100).translate(600, 200);
const pentagon = new RegularPolygon(5).scale(100).translate(200, 600);
const circle = new RegularPolygon(60).scale(100).translate(600, 600);
const pacman = new Pacman().scale(100).translate(400, 400);

const polygons = [triangle, square, pentagon, circle, pacman];

app.ticker.add(() => {
    if (pause) return;
    if (mouse.x > view.width) return;
    if (mouse.y > view.height) return;

    const polygonPoints = [];

    polygons.forEach(polygon => polygon.points.forEach(point => {
        polygonPoints.push(point.rotate(1 / justABigNumber, mouse));
        polygonPoints.push(point.rotate(-1 / justABigNumber, mouse));
    }));

    polygonPoints.concat(corners.points);

    const polygonSegments = [];

    polygons.forEach(polygon => polygonSegments.push(...polygon.getSegments()));

    const rays = [];

    polygonPoints.forEach(point => {
        const ray = new Segment(mouse, point).extend(justABigNumber);
        let shortest = ray;

        polygonSegments.forEach(segment => {
            const intersection = segment.intersection(ray);

            if (intersection) {
                const distance = mouse.distance(intersection);

                if (distance < shortest.length) {
                    shortest = new Segment(mouse, intersection);
                }
            }
        });

        rays.push(shortest);
    });

    g.clear();
    g.lineStyle(1, color, 1);

    if (!wireFrame) {
        g.beginFill(color);
    }

    polygons.forEach(polygon => polygon.draw(g));

    if (!wireFrame) {
        g.endFill();
    }
}, PIXI.UPDATE_PRIORITY.LOW);
app.ticker.start();
