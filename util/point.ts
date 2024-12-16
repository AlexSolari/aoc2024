import { Direction } from './direction';

export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(vec: Vector) {
        return new Point(this.x + vec.x, this.y + vec.y);
    }

    clone() {
        return new Point(this.x, this.y);
    }

    static constant = {
        map: new Map<string, Point>(),
        from: function (x: number, y: number) {
            const key = `${x};${y}`;
            if (!this.map.has(key)) {
                this.map.set(key, new Point(x, y));
            }

            return this.map.get(key)!;
        }
    };
}

export class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static fromPoints(p1: Point, p2: Point) {
        const x = p2.x - p1.x;
        const y = p2.y - p1.y;
        return new Vector(x, y);
    }

    static directions = {
        [Direction.Up]: new Vector(0, -1),
        [Direction.Down]: new Vector(0, 1),
        [Direction.Right]: new Vector(1, 0),
        [Direction.Left]: new Vector(-1, 0),
        All: [
            new Vector(0, -1),
            new Vector(0, 1),
            new Vector(1, 0),
            new Vector(-1, 0)
        ]
    };
}
