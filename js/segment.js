import { Point } from './point.js';
export class Segment {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    angle() {
        return Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
    }

    draw(graphics) {
        graphics.moveTo(this.p1.x, this.p1.y);
        graphics.lineTo(this.p2.x, this.p2.y);
    }

    extend(length) {
        const angle = this.angle();
        const x = this.p2.x + Math.cos(angle) * length;
        const y = this.p2.y + Math.sin(angle) * length;
        return new Segment(this.p1, new Point(x, y));
    }

    intersection(segment) {
        const r = this.p2.subtract(this.p1);
        const s = segment.p2.subtract(segment.p1);
        const rxs = r.crossProduct(s);
        const cma = segment.p1.subtract(this.p1);
        const t = cma.crossProduct(s) / rxs;
        const u = cma.crossProduct(r) / rxs;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return new Point(
                this.p1.x + t * r.x,
                this.p1.y + t * r.y
            );
        }
    }

    length() {
        return this.p2.distance(this.p1);
    }
}