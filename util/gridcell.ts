export const up = Symbol('up'),
    down = Symbol('down'),
    left = Symbol('left'),
    right = Symbol('right'),
    value = Symbol('value');

export class GridCell<T> {
    x!: number;
    y!: number;

    get next(): GridCell<T>[] {
        return [this[up], this[down], this[left], this[right]].filter(
            (x) => x != undefined
        );
    }

    get key() {
        return `${this.x};${this.y}`;
    }

    [up]: GridCell<T> | undefined;
    [down]: GridCell<T> | undefined;
    [left]: GridCell<T> | undefined;
    [right]: GridCell<T> | undefined;
    [value]: T;

    constructor(val: T, x?: number, y?: number) {
        this[value] = val;

        if (x != undefined && y != undefined) {
            this.setCoords(x, y);
        }
    }

    setCoords(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
