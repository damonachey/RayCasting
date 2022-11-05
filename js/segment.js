export class Segment {
    constructor({ p1, p2 }) {
        this.p1 = p1;
        this.p2 = p2;
    }

    get length() {
        return Math.sqrt(Math.pow(this.p2.x - this.p1.x, 2) + Math.pow(this.p2.y - this.p1.y, 2));
    }

    get angle() {
        return Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
    }

    extend({ length }) {
        const angle = this.angle;
        const x = this.p2.x + Math.cos(angle) * length;
        const y = this.p2.y + Math.sin(angle) * length;
        return new Segment({ p1: this.p1, p2: new Point({ x, y }) });
    }
}