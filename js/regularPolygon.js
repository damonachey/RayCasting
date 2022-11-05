import { Point } from './point.js';
import { Polygon } from "./polygon.js";

export class RegularPolygon extends Polygon {
    constructor(facets) {
        super([]);

        for (let i = 0; i < facets; i++) {
            const angle = (i / facets) * Math.PI * 2;
            this.points.push(new Point(Math.cos(angle), Math.sin(angle)));
        }
    }
}