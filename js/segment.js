import { Point } from './point.js';

export class Segment {
    constructor(point1, point2) {
        this.point1 = point1;
        this.point2 = point2;
    }

    angle() {
        return Math.atan2(this.point2.y - this.point1.y, this.point2.x - this.point1.x);
    }

    draw(graphics) {
        graphics.moveTo(this.point1.x, this.point1.y);
        graphics.lineTo(this.point2.x, this.point2.y);
    }

    extend(length) {
        const angle = this.angle();
        const x = this.point2.x + Math.cos(angle) * length;
        const y = this.point2.y + Math.sin(angle) * length;
        return new Segment(this.point1, new Point(x, y));
    }

    intersection(segment) {
        const r = this.point2.subtract(this.point1);
        const s = segment.point2.subtract(segment.point1);
        const rxs = r.crossProduct(s);
        const cma = segment.point1.subtract(this.point1);
        const t = cma.crossProduct(s) / rxs;
        const u = cma.crossProduct(r) / rxs;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return new Point(
                this.point1.x + t * r.x,
                this.point1.y + t * r.y
            );
        }
    }

    length() {
        return this.point2.distance(this.point1);
    }
}