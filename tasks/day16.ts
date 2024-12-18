import { GridCell, value, Grid } from '../util/grid';
import { ObjectSet } from '../util/objectSet';
import { parse } from '../util/parse';
import { Point, Vector } from '../util/point';

enum Values {
    EMPTY = '.',
    DEER = 'S',
    WALL = '#',
    EXIT = 'E'
}

interface AStarNode {
    point: Point;
    startCost: number;
    targetCost: number;
    totalCost: number;
    turns: number;
    parent: AStarNode | undefined;
}

interface DijkstraNode {
    point: Point;
    distance: number;
    turns: number;
    direction: number | undefined;
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

        const calculateTurns = (
            current: AStarNode | undefined,
            direction: Vector
        ) => {
            if (current == undefined || current.parent == undefined) return 0;

            const prevDirection = {
                x: current.point.x - current.parent.point.x,
                y: current.point.y - current.parent.point.y
            };
            return prevDirection.x !== direction.x ||
                prevDirection.y !== direction.y
                ? 1
                : 0;
        };

        const startNode: AStarNode = {
            point: this.deerPosition,
            startCost: 0,
            targetCost: heuristic(this.deerPosition, this.exitPosition),
            totalCost: heuristic(this.deerPosition, this.exitPosition),
            turns: 0,
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

                return {
                    path: path,
                    turns: currentNode.turns
                };
            }

            closedSet.add(currentNode.point);

            for (const dir of Vector.directions.All) {
                const neighborX = currentNode.point.x + dir.x;
                const neighborY = currentNode.point.y + dir.y;

                if (!this.isLocationFree(neighborX, neighborY)) continue;

                const neighborPoint = Point.constant.from(neighborX, neighborY);

                if (closedSet.has(neighborPoint)) continue;

                const g = currentNode.startCost + 1;
                const additionalTurns = calculateTurns(currentNode, dir);
                const turns = currentNode.turns + additionalTurns;
                const weightedTurns = turns * 1000;
                const h = heuristic(neighborPoint, this.exitPosition);
                const f = g + h + weightedTurns;

                const existingNode = openList.find(
                    (node) =>
                        node.point.x == neighborX && node.point.y == neighborY
                );

                if (existingNode) {
                    if (g < existingNode.startCost) {
                        existingNode.startCost = g;
                        existingNode.totalCost = f;
                        existingNode.parent = currentNode;
                        existingNode.turns = turns;
                    }
                } else {
                    openList.push({
                        point: neighborPoint,
                        startCost: g,
                        targetCost: h,
                        totalCost: f,
                        parent: currentNode,
                        turns: turns
                    });
                }
            }
        }

        return {
            path: [],
            turns: 0
        };
    }

    dijkstraPaths() {
        const rows = this.grid.length;
        const cols = this.grid[0].length;

        const reconstructPaths = (current: Point): Point[][] => {
            if (current.x === start.x && current.y === start.y)
                return [[start]];
            const key = `${current.x},${current.y}`;
            if (!(key in prev)) return [];

            const paths: Point[][] = [];
            for (const prevPoint of prev[key]) {
                const subPaths = reconstructPaths(prevPoint);
                for (const subPath of subPaths) {
                    paths.push([...subPath, current]);
                }
            }
            return paths;
        };

        const dist: number[][] = Array.from({ length: rows }, () =>
            Array(cols).fill(Infinity)
        );
        const score: number[][] = Array.from({ length: rows }, () =>
            Array(cols).fill(Infinity)
        );

        const prev: Record<string, Point[]> = {};

        const start = this.deerPosition.clone();
        const queue: DijkstraNode[] = [
            { point: start, distance: 0, turns: 0, direction: undefined }
        ];
        score[start.x][start.y] = 0;
        prev[`${start.x},${start.y}`] = [];

        while (queue.length > 0) {
            queue.sort((a, b) => a.turns - b.turns || a.distance - b.distance);
            const {
                point,
                distance,
                turns: currentTurns,
                direction
            } = queue.shift()!;

            if (1000 * currentTurns + distance > score[point.x][point.y])
                continue;

            for (
                let dirIndex = 0;
                dirIndex < Vector.directions.All.length;
                dirIndex++
            ) {
                const dir = Vector.directions.All[dirIndex];
                const nx = point.x + dir.x;
                const ny = point.y + dir.y;

                if (!this.isLocationFree(nx, ny)) continue;

                const newDist = distance + 1;
                const newTurns =
                    direction == null || direction == dirIndex
                        ? currentTurns
                        : currentTurns + 1;

                const newScore = 1000 * newTurns + newDist;

                if (newScore < score[nx][ny]) {
                    score[nx][ny] = newScore;
                    dist[nx][ny] = newDist;

                    queue.push({
                        point: Point.constant.from(nx, ny),
                        distance: newDist,
                        turns: newTurns,
                        direction: dirIndex
                    });

                    prev[`${nx},${ny}`] = [point];
                } else if (newDist == dist[nx][ny]) {
                    prev[`${nx},${ny}`].push(point);
                }
            }
        }

        return reconstructPaths(this.exitPosition);
    }
}

function getData() {
    return parse('tasks\\data\\16.txt', (input) => {
        const raw = input.split('\r\n').map((r) => r.trim().split(''));
        const maxCoordY = raw.length - 1;
        const maxCoordX = raw[0].length - 1;

        const grid = Grid.ofSize<string>(maxCoordX, maxCoordY, Values.EMPTY);

        let deerPosition: Point;
        let exitPosition: Point;

        for (let y = 0; y <= maxCoordY; y++) {
            for (let x = 0; x <= maxCoordX; x++) {
                const char = raw[y][x];
                grid[y][x][value] = char;

                if (char == Values.DEER)
                    deerPosition = Point.constant.from(x, y);
                if (char == Values.EXIT)
                    exitPosition = Point.constant.from(x, y);
            }
        }

        return new Maze(grid, deerPosition!, exitPosition!);
    });
}

function countTurns(points: Point[]) {
    let turns = 0;
    for (let i = 2; i < points.length; i++) {
        const { x: PPx, y: PPy } = points[i - 2];
        const { x: x, y: y } = points[i];

        if (x != PPx && y != PPy) turns++;
    }
    return turns;
}

export async function pt1() {
    const data = await getData();

    const pathSearchResult = data.aStarPath();

    return pathSearchResult.turns * 1000 + pathSearchResult.path.length - 1;
}

export async function pt2() {
    const data = await getData();

    const initialPath = data.aStarPath();
    const allPaths = data.dijkstraPaths();
    const correctPaths = allPaths.filter(
        (x) => countTurns(x) == initialPath.turns
    );

    const allPoints = new ObjectSet(
        correctPaths.flat(),
        (p) => `${p.x};${p.y}`
    );
    return allPoints.length;
}
