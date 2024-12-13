import { ObjectSet } from '../util/objectSet';
import { parse } from '../util/parse';

const up = Symbol('up'),
    down = Symbol('down'),
    left = Symbol('left'),
    right = Symbol('right'),
    value = Symbol('value');

class GridCell {
    x!: number;
    y!: number;

    get next(): GridCell[] {
        return [this[up], this[down], this[left], this[right]].filter(
            (x) => x != undefined
        );
    }

    get key() {
        return `${this.x};${this.y}`;
    }

    [up]: GridCell | undefined;
    [down]: GridCell | undefined;
    [left]: GridCell | undefined;
    [right]: GridCell | undefined;
    [value]: string = 'null';

    constructor(val: string, x?: number, y?: number) {
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

function getAreaAndPerimeter(region: GridCell[]) {
    const area = region.length;
    let perimeter = 0;

    const directions = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
    ];

    for (const { x, y } of region) {
        let sidesExposed = 4;

        for (const [dx, dy] of directions) {
            if (region.find((p) => p.x == x + dx && p.y == y + dy)) {
                sidesExposed--;
            }
        }

        perimeter += sidesExposed;
    }

    return {
        area,
        perimeter
    };
}

function dfs(
    cell: GridCell,
    area: GridCell[],
    visited: ObjectSet<GridCell>,
    getNext: (pivot: GridCell) => GridCell[]
) {
    if (visited.has(cell)) return;

    visited.add(cell);
    area.push(cell);

    for (const neighbor of getNext(cell)) {
        dfs(neighbor, area, visited, getNext);
    }
}

function findRegions(grid: GridCell[][]): GridCell[][] {
    const regions: GridCell[][] = [];
    const visited = new ObjectSet<GridCell>([], (obj) => obj.key);

    for (const row of grid) {
        for (const cell of row) {
            if (!visited.has(cell)) {
                const region: GridCell[] = [];

                dfs(cell, region, visited, (cell) =>
                    cell.next.filter((x) => !visited.has(x))
                );
                if (region.length > 0) {
                    regions.push(region);
                }
            }
        }
    }

    return regions;
}

function groupAdjacentGridCells(points: GridCell[]): GridCell[][] {
    const groups: GridCell[][] = [];
    const visited = new ObjectSet<GridCell>([], (obj) => obj.key);

    for (const point of points) {
        if (!visited.has(point)) {
            const group: GridCell[] = [];

            dfs(point, group, visited, (point) =>
                points.filter((p) => !visited.has(p) && point.next.includes(p))
            );
            groups.push(group);
        }
    }

    return groups;
}

function getCorners(region: GridCell[]) {
    const noTop = groupAdjacentGridCells(
        region.filter((x) => x[up] == undefined)
    ).length;
    const noBot = groupAdjacentGridCells(
        region.filter((x) => x[down] == undefined)
    ).length;
    const noLeft = groupAdjacentGridCells(
        region.filter((x) => x[left] == undefined)
    ).length;
    const noRight = groupAdjacentGridCells(
        region.filter((x) => x[right] == undefined)
    ).length;

    return noTop + noBot + noLeft + noRight;
}

function getData() {
    return parse('tasks\\data\\12.txt', (input) => {
        const grid = input
            .trim()
            .split('\n')
            .map((x) =>
                x
                    .trim()
                    .split('')
                    .map((c) => new GridCell(c))
            );
        const maxCoord = grid[0].length - 1;

        for (let y = 0; y <= maxCoord; y++) {
            for (let x = 0; x <= maxCoord; x++) {
                const cell = grid[y][x];

                cell.setCoords(x, y);

                if (x > 0 && grid[y][x - 1][value] == cell[value]) {
                    cell[left] = grid[y][x - 1];
                }
                if (x < maxCoord && grid[y][x + 1][value] == cell[value]) {
                    cell[right] = grid[y][x + 1];
                }
                if (y > 0 && grid[y - 1][x][value] == cell[value]) {
                    cell[up] = grid[y - 1][x];
                }
                if (y < maxCoord && grid[y + 1][x][value] == cell[value]) {
                    cell[down] = grid[y + 1][x];
                }
            }
        }

        return grid;
    });
}

export async function pt1() {
    const data = await getData();

    return findRegions(data)
        .map((region) => {
            const res = getAreaAndPerimeter(region);

            return res.area * res.perimeter;
        })
        .reduce((x, y) => x + y);
}

export async function pt2() {
    const data = await getData();

    return findRegions(data)
        .map((region) => {
            const res = getAreaAndPerimeter(region);
            const corners = getCorners(region);

            return res.area * corners;
        })
        .reduce((x, y) => x + y);
}