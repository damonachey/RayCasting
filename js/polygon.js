import { Point } from './point.js';

export class Polygon {
    constructor({ points }) {
        this.points = points;
    }

    draw(graphics) {
        graphics.drawPolygon(this.points);

        return graphics;
    }

    rotate({ origin = { x: 0, y: 0 }, angle }) {
        this.points = this.points.map((point) => new Point({
            x: origin.x + (point.x - origin.x) * Math.cos(angle) - (point.y - origin.y) * Math.sin(angle),
            y: origin.y + (point.y - origin.y) * Math.cos(angle) + (point.x - origin.x) * Math.sin(angle),
        }));

        return this;
    }

    scale({ origin = { x: 0, y: 0 }, scale }) {
        this.points = this.points.map((point) => new Point({
            x: origin.x + (point.x - origin.x) * scale,
            y: origin.y + (point.y - origin.y) * scale,
        }));

        return this;
    }

    translate({ x, y }) {
        this.points = this.points.map((point) => new Point({
            x: point.x + x,
            y: point.y + y,
        }));

        console.log(this.points);

        return this;
    }
}