import { GridCell, value, Grid } from '../util/grid';
import { ObjectSet } from '../util/objectSet';
import { parse } from '../util/parse';
import { Point, Vector } from '../util/point';

enum Values {
    EMPTY = '.',
    START = 'S',
    WALL = '#',
    EXIT = 'E'
}

interface DijkstraNode {
    point: Point;
    distance: number;
}

class Maze {
    grid: GridCell<string>[][];

    startPosition: Point;
    exitPosition: Point;

    maxX!: number;
    maxY!: number;

    constructor(
        grid: GridCell<string>[][],
        startPosition: Point,
        exitPosition: Point
    ) {
        this.grid = grid;
        this.startPosition = exitPosition;
        this.exitPosition = startPosition;

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
        const prev: Record<string, Point[]> = {};

        const start = this.startPosition.clone();
        const queue: DijkstraNode[] = [{ point: start, distance: 0 }];
        prev[`${start.x},${start.y}`] = [];
        dist[start.x][start.y] = 0;

        while (queue.length > 0) {
            queue.sort((a, b) => a.distance - b.distance);
            const { point, distance } = queue.shift()!;

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
                if (newDist < dist[nx][ny]) {
                    dist[nx][ny] = newDist;

                    queue.push({
                        point: Point.constant.from(nx, ny),
                        distance: newDist
                    });

                    prev[`${nx},${ny}`] = [point];
                } else if (newDist == dist[nx][ny]) {
                    prev[`${nx},${ny}`].push(point);
                }
            }
        }

        const cheats: {
            diff: number;
            x: number;
            y: number;
        }[] = [];

        for (let y = 0; y < this.maxY; y++) {
            for (let x = 0; x < this.maxX; x++) {
                if (
                    dist[x][y] == Infinity &&
                    dist[x + 1]?.[y] != undefined &&
                    dist[x - 1]?.[y] != undefined &&
                    dist[x + 1]?.[y] != Infinity &&
                    dist[x - 1]?.[y] != Infinity
                ) {
                    cheats.push({
                        diff: Math.abs(dist[x + 1][y] - dist[x - 1][y]) - 2,
                        x,
                        y
                    });
                }

                if (
                    dist[x][y] == Infinity &&
                    dist[x][y + 1] != undefined &&
                    dist[x][y - 1] != undefined &&
                    dist[x][y + 1] != Infinity &&
                    dist[x][y - 1] != Infinity
                ) {
                    cheats.push({
                        diff: Math.abs(dist[x][y + 1] - dist[x][y - 1]) - 2,
                        x,
                        y
                    });
                }
            }
        }

        return { paths: reconstructPaths(this.exitPosition), cheats };
    }
}

function getData() {
    return parse('tasks\\data\\20.txt', (input) => {
        const raw = input.split('\r\n').map((r) => r.trim().split(''));
        const maxCoordY = raw.length - 1;
        const maxCoordX = raw[0].length - 1;

        const grid = Grid.ofSize<string>(maxCoordX, maxCoordY, Values.EMPTY);

        let startPosition: Point;
        let exitPosition: Point;

        for (let y = 0; y <= maxCoordY; y++) {
            for (let x = 0; x <= maxCoordX; x++) {
                const char = raw[y][x];
                grid[y][x][value] = char;

                if (char == Values.START)
                    startPosition = Point.constant.from(x, y);
                if (char == Values.EXIT)
                    exitPosition = Point.constant.from(x, y);
            }
        }

        return new Maze(grid, startPosition!, exitPosition!);
    });
}

export async function pt1() {
    const data = await getData();

    const allPaths = data.dijkstraPaths();
    return allPaths.cheats.filter((x) => x.diff >= 100).length;
}

export async function pt2() {}
