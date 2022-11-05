export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distance(point) {
        return Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));
    }

    rotate(angle, origin = { x: 0, y: 0 }) {
        return new Point(
            origin.x + (this.x - origin.x) * Math.cos(angle) - (this.y - origin.y) * Math.sin(angle),
            origin.y + (this.y - origin.y) * Math.cos(angle) + (this.x - origin.x) * Math.sin(angle)
        );
    }
}