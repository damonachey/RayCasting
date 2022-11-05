import { RegularPolygon } from './js/regularPolygon.js';
import { Pacman } from './js/pacman.js';

const view = document.getElementById('view');
const app = new PIXI.Application({
    view: view,
    width: 800,
    height: 800,
    backgroundColor: 0x1e1e1e,
    antialias: true,
});

let pause = false;
let wireFrame = false;

let mouse = { x: 0, y: 0 };

window.addEventListener('keydown', function (event) {
    if (event.key == 'p') pause = !pause;
    if (event.key == 'w') wireFrame = !wireFrame;
});

view.addEventListener('mousemove', function(event){
    mouse = { x: event.clientX, y: event.clientY };
});

const g = new PIXI.Graphics();
app.stage.addChild(g);

const color = 0x0000ff;

const corners = { points: [{ x: 0, y: 0 }, { x: view.width, y: 0 }, { x: view.width, y: view.height }, { x: 0, y: view.height }] };
const triangle = new RegularPolygon({ facets: 3 }).scale({ scale: 100 }).translate({ x: 200, y: 200 });
const square = new RegularPolygon({ facets: 4 }).scale({ scale: 100 }).translate({ x: 600, y: 200 });
const pentagon = new RegularPolygon({ facets: 5 }).scale({ scale: 100 }).translate({ x: 200, y: 600 });
const circle = new RegularPolygon({ facets: 60 }).scale({ scale: 100 }).translate({ x: 600, y: 600 });
const pacman = new Pacman({ facets: 60 }).scale({ scale: 100 }).translate({ x: 400, y: 400 });

const polygons = [triangle, square, pentagon, circle, pacman];

app.ticker.add(() => {
    if (pause) return;

    g.clear();
    g.lineStyle(1, color, 1);

    if (!wireFrame) {
        g.beginFill(color);
    }

    polygons.forEach((polygon) => polygon.draw(g));

    if (!wireFrame) {
        g.endFill();
    }
}, PIXI.UPDATE_PRIORITY.LOW);
app.ticker.start();
