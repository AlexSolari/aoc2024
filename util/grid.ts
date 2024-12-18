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

export const Grid = {
    ofSize<T>(maxCoordX: number, maxCoordY: number, emptyValue: T) {
        const grid: GridCell<T>[][] = [];

        for (let y = 0; y <= maxCoordY; y++) {
            grid[y] = [];
            for (let x = 0; x <= maxCoordX; x++) {
                grid[y][x] = new GridCell(emptyValue, x, y);
            }
        }

        for (let y = 0; y <= maxCoordY; y++) {
            for (let x = 0; x <= maxCoordX; x++) {
                grid[y][x][value] = emptyValue;

                link(x, y, grid, grid[y][x], maxCoordX, maxCoordY);
            }
        }

        return grid;
    },

    ofSizeWithValues<T>(
        maxCoordX: number,
        maxCoordY: number,
        emptyValue: T,
        source: T[][],
        linkFunction?: (
            x: number,
            y: number,
            grid: GridCell<T>[][],
            cell: GridCell<T>,
            maxCoordX?: number,
            maxCoordY?: number
        ) => void
    ) {
        const grid: GridCell<T>[][] = [];

        for (let y = 0; y <= maxCoordY; y++) {
            grid[y] = [];
            for (let x = 0; x <= maxCoordX; x++) {
                grid[y][x] = new GridCell(emptyValue, x, y);
            }
        }

        for (let y = 0; y <= maxCoordY; y++) {
            for (let x = 0; x <= maxCoordX; x++) {
                grid[y][x][value] = source[y][x];
            }
        }

        for (let y = 0; y <= maxCoordY; y++) {
            for (let x = 0; x <= maxCoordX; x++) {
                (linkFunction ?? link)(
                    x,
                    y,
                    grid,
                    grid[y][x],
                    maxCoordX,
                    maxCoordY
                );
            }
        }

        return grid;
    }
};

function link<T>(
    x: number,
    y: number,
    grid: GridCell<T>[][],
    cell: GridCell<T>,
    maxCoordX: number,
    maxCoordY: number
) {
    if (x > 0 && grid[y][x - 1][value]) {
        cell[left] = grid[y][x - 1];
    }
    if (x < maxCoordX && grid[y][x + 1][value]) {
        cell[right] = grid[y][x + 1];
    }
    if (y > 0 && grid[y - 1][x][value]) {
        cell[up] = grid[y - 1][x];
    }
    if (y < maxCoordY && grid[y + 1][x][value]) {
        cell[down] = grid[y + 1][x];
    }
}
