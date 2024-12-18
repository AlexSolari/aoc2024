import { GridCell, up, down, left, right, value } from '../util/gridcell';
import { ObjectSet } from '../util/objectSet';
import { parse } from '../util/parse';
import { Point, Vector } from '../util/point';

let raw: string[] = [];

enum Values {
    EMPTY = '.',
    WALL = '#'
}

interface AStarNode {
    point: Point;
    startCost: number;
    targetCost: number;
    totalCost: number;
    parent: AStarNode | undefined;
}
class Maze {
    grid: GridCell<string>[][];

    deerPosition: Point;
    exitPosition: Point;

    maxX!: number;
    maxY!: number;

    constructor(
        grid: GridCell<string>[][],
        robotPosition: Point,
        exitPosition: Point
    ) {
        this.grid = grid;
        this.deerPosition = exitPosition;
        this.exitPosition = robotPosition;

        this.maxY = this.grid.length;
        this.maxX = this.grid[0].length;
    }

    private isLocationFree(x: number, y: number) {
        return (
            x >= 0 &&
            y >= 0 &&
            x < this.maxX &&
            y < this.maxY &&
            this.grid[y][x][value] !== Values.WALL
        );
    }

    aStarPath() {
        const heuristic = (a: Point, b: Point) =>
            Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

        const startNode: AStarNode = {
            point: this.deerPosition,
            startCost: 0,
            targetCost: heuristic(this.deerPosition, this.exitPosition),
            totalCost: heuristic(this.deerPosition, this.exitPosition),
            parent: undefined
        };

        const openList: AStarNode[] = [startNode];
        const closedSet = new ObjectSet<Point>(
            [],
            (point) => `${point.x},${point.y}`
        );

        while (openList.length > 0) {
            openList.sort((a, b) => a.totalCost - b.totalCost);
            const currentNode = openList.shift()!;

            if (
                currentNode.point.x == this.exitPosition.x &&
                currentNode.point.y == this.exitPosition.y
            ) {
                const path: Point[] = [];
                let node: AStarNode | undefined = currentNode;
                while (node) {
                    path.unshift(node.point);
                    node = node.parent;
                }

                return path;
            }

            closedSet.add(currentNode.point);

            for (const dir of Vector.directions.All) {
                const neighborX = currentNode.point.x + dir.x;
                const neighborY = currentNode.point.y + dir.y;

                if (!this.isLocationFree(neighborX, neighborY)) continue;

                const neighborPoint = Point.constant.from(neighborX, neighborY);

                if (closedSet.has(neighborPoint)) continue;

                const g = currentNode.startCost + 1;
                const h = heuristic(neighborPoint, this.exitPosition);
                const f = g + h;

                const existingNode = openList.find(
                    (node) =>
                        node.point.x == neighborX && node.point.y == neighborY
                );

                if (existingNode) {
                    if (g < existingNode.startCost) {
                        existingNode.startCost = g;
                        existingNode.totalCost = f;
                        existingNode.parent = currentNode;
                    }
                } else {
                    openList.push({
                        point: neighborPoint,
                        startCost: g,
                        targetCost: h,
                        totalCost: f,
                        parent: currentNode
                    });
                }
            }
        }

        return [];
    }
}

async function getData(count: number) {
    const slice = (
        await parse('tasks\\data\\18.txt', (input) => {
            const res = input.split('\r\n');
            raw = res;
            return res;
        })
    ).slice(0, count);
    const grid: GridCell<string>[][] = [];
    const maxCoordY = 70;
    const maxCoordX = 70;

    for (let y = 0; y <= maxCoordY; y++) {
        grid[y] = [];
        for (let x = 0; x <= maxCoordX; x++) {
            grid[y][x] = new GridCell<string>(Values.EMPTY, x, y);
        }
    }

    for (let y = 0; y <= maxCoordY; y++) {
        for (let x = 0; x <= maxCoordX; x++) {
            const cell = grid[y][x];

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
    }

    slice.forEach((pc) => {
        const [x, y] = pc.split(',').map((x) => Number(x));

        grid[y][x][value] = Values.WALL;
    });

    return new Maze(
        grid,
        Point.constant.from(0, 0)!,
        Point.constant.from(maxCoordX, maxCoordY)
    );
}

export async function pt1() {
    const data = await getData(1024);
    const astar = data.aStarPath();

    return astar.length - 1;
}

export async function pt2() {
    let i = 1025;
    const data = await getData(i);
    let astar: Point[];

    do {
        astar = data.aStarPath();
        i++;

        const [x, y] = raw[i].split(',').map((x) => Number(x));
        data.grid[y][x][value] = Values.WALL;
    } while (astar.length != 0);

    return raw[i - 1];
}
