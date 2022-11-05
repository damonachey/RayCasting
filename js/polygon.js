import { Point } from './point.js';
import { Segment } from './segment.js';

export class Polygon {
    constructor({ points }) {
        this.points = points;
    }

    draw(graphics) {
        graphics.drawPolygon(this.points);

        return graphics;
    }

    rotate({ origin = { x: 0, y: 0 }, angle }) {
        this.points = this.points.map(point => point.rotate({ origin, angle }));

        return this;
    }

    scale({ origin = { x: 0, y: 0 }, scale }) {
        this.points = this.points.map(point => new Point({
            x: origin.x + (point.x - origin.x) * scale,
            y: origin.y + (point.y - origin.y) * scale,
        }));

        return this;
    }

    translate({ x, y }) {
        this.points = this.points.map(point => new Point({
            x: point.x + x,
            y: point.y + y,
        }));

        return this;
    }

    getSegments() {
        const segments = [];

        for (let i = 0; i < this.points.length; i++) {
            const pointA = this.points[i];
            const pointB = this.points[i + 1] || this.points[0];

            segments.push(new Segment({ pointA, pointB }));
        }

        return segments;
    }
}