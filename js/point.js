export class Point {
    constructor({ x, y }) {
        this.x = x;
        this.y = y;
    }

    rotate({ origin = { x: 0, y: 0 }, angle }) {
        return new Point({
            x: origin.x + (this.x - origin.x) * Math.cos(angle) - (this.y - origin.y) * Math.sin(angle),
            y: origin.y + (this.y - origin.y) * Math.cos(angle) + (this.x - origin.x) * Math.sin(angle),
        });
    }
}