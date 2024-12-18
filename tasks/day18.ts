import { GridCell, value, Grid } from '../util/grid';
import { ObjectSet } from '../util/objectSet';
import { parse } from '../util/parse';
import { Point, Vector } from '../util/point';

let points: Point[] = [];

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
    const raw = await parse('tasks\\data\\18.txt', (input) =>
        input.split('\r\n')
    );
    const maxCoordY = 70;
    const maxCoordX = 70;

    const grid = Grid.ofSize(maxCoordX, maxCoordY, Values.EMPTY);

    raw.forEach((pc, i) => {
        const [x, y] = pc.split(',').map((x) => Number(x));
        points.push(Point.constant.from(x, y));

        if (i < count) grid[y][x][value] = Values.WALL;
    });

    return new Maze(
        grid,
        Point.constant.from(0, 0),
        Point.constant.from(maxCoordX, maxCoordY)
    );
}

export async function pt1() {
    const data = await getData(1024);
    const astar = data.aStarPath();

    return astar.length - 1;
}

export async function pt2() {
    let i = 1024;
    const data = await getData(i);
    let astar: Point[] = data.aStarPath();

    do {
        i++;
        const point = points[i];
        data.grid[point.y][point.x][value] = Values.WALL;

        if (astar.indexOf(point) != -1) {
            astar = data.aStarPath();
        }
    } while (astar.length != 0);

    return points[i];
}
