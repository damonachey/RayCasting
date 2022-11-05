import { Point } from "./point.js";
import { Polygon } from "./polygon.js";

export class Pacman extends Polygon {
    constructor({ facets = 60 }) {
        super({ points: [] });

        for (let i = 0; i < facets * 11 / 12; i++) {
            const angle = (i / facets) * Math.PI * 2;
            this.points.push(new Point({
                x: Math.cos(angle),
                y: Math.sin(angle),
            }));
        }

        this.points.push(new Point({ x: 0, y: 0 }));
    }
}