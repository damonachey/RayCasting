import { Point } from './point.js';
import { Segment } from './segment.js';

export class Polygon {
    constructor(points) {
        this.points = points;
    }

    draw(graphics) {
        graphics.drawPolygon(this.points);
    }

    rotate(angle, origin = { x: 0, y: 0 }) {
        return new Polygon(this.points.map(point => point.rotate(angle, origin)));
    }

    scale(scale, origin = { x: 0, y: 0 }) {
        return new Polygon(this.points.map(point => new Point(
            origin.x + (point.x - origin.x) * scale,
            origin.y + (point.y - origin.y) * scale
            )));
    }

    translate(x, y) {
        return new Polygon(this.points.map(point => new Point(
            point.x + x,
            point.y + y
        )));
    }

    segments() {
        const segments = [];

        for (let i = 0; i < this.points.length; i++) {
            const pointA = this.points[i];
            const pointB = this.points[i + 1] || this.points[0];

            segments.push(new Segment(pointA, pointB));
        }

        return segments;
    }
}