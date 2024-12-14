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
}
