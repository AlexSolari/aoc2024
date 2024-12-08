import { ObjectSet } from '../util/objectSet';
import { parse } from '../util/parse';

enum Direction {
    Up,
    Right,
    Down,
    Left
}

interface Point {
    x: number;
    y: number;
}

interface DirectionalPoint extends Point {
    direction: Direction;
}

class GameMap extends Array<Array<boolean>> {
    maxX = 0;
    maxY = 0;

    start: Point = { x: 0, y: 0 };

    playerPos: Point = { x: 0, y: 0 };
    playerDirection = Direction.Down;

    probePos: Point = { x: 0, y: 0 };
    probeDirection = Direction.Down;

    pointsVisited: ObjectSet<Point> = new ObjectSet<Point>();
    possibleLoops: ObjectSet<Point> = new ObjectSet<Point>();

    constructor(data: string[]) {
        super();

        data.forEach((row, i) => {
            this[i] = [];
            row.split('').forEach((cell, i2) => {
                if (cell == '^') {
                    this.playerPos = {
                        x: i2,
                        y: i
                    };
                    this.start = { ...this.playerPos };
                    this.pointsVisited.add({ ...this.playerPos });
                }

                this[i][i2] = cell != '#';
            });
        });

        this.maxY = this.length - 1;
        this.maxX = this[0].length - 1;
    }

    //#region Utils

    private getNextCell({ x, y }: Point, direction: Direction) {
        let nextX = x;
        let nextY = y;
        let nextVal: boolean;

        switch (direction) {
            case Direction.Down:
                nextY = y - 1;

                if (nextY < 0 || nextX < 0 || nextX > this.maxX) {
                    return null;
                }
                nextVal = this[nextY][nextX];
                break;
            case Direction.Up:
                nextY = y + 1;
                if (nextY > this.maxY || nextX < 0 || nextX > this.maxX) {
                    return null;
                }

                nextVal = this[nextY][nextX];
                break;
            case Direction.Left:
                nextX = x + 1;
                if (nextX > this.maxX || nextY < 0 || nextY > this.maxX) {
                    return null;
                }

                nextVal = this[nextY][nextX];
                break;
            case Direction.Right:
                nextX = x - 1;
                if (nextX < 0 || nextY < 0 || nextY > this.maxX) {
                    return null;
                }

                nextVal = this[nextY][nextX];
                break;
        }

        return { nextX, nextY, nextVal };
    }

    private getNextDirection(direction: Direction) {
        switch (direction) {
            case Direction.Up:
                return Direction.Right;
            case Direction.Down:
                return Direction.Left;
            case Direction.Left:
                return Direction.Up;
            case Direction.Right:
                return Direction.Down;
        }
    }

    private isPointInBounds(p: Point) {
        return p.x <= this.maxX && p.y <= this.maxY && p.x >= 0 && p.y >= 0;
    }

    //#endregion

    movePlayer() {
        if (!this.isPointInBounds(this.playerPos)) {
            return false;
        }

        const nextCell = this.getNextCell(this.playerPos, this.playerDirection);

        if (nextCell == null) {
            return false;
        }

        if (!nextCell.nextVal) {
            this.playerDirection = this.getNextDirection(this.playerDirection);
            return true;
        } else {
            switch (this.playerDirection) {
                case Direction.Down:
                    this.playerPos.y -= 1;
                    break;
                case Direction.Up:
                    this.playerPos.y += 1;
                    break;
                case Direction.Left:
                    this.playerPos.x += 1;
                    break;
                case Direction.Right:
                    this.playerPos.x -= 1;
                    break;
            }
            if (!this.pointsVisited.has(this.playerPos)) {
                this.pointsVisited.add({ ...this.playerPos });
            }
        }

        return true;
    }

    //#region Probe

    probe({ x, y }: Point) {
        this[y][x] = false;
        const loopFound = this.launchProbe();
        this[y][x] = true;

        return loopFound;
    }

    private launchProbe() {
        const probeCoords: DirectionalPoint[] = [];
        let lastProbeCoords: DirectionalPoint;
        let canMoveProbe = true;

        this.probePos = { ...this.start };
        this.probeDirection = Direction.Down;

        do {
            canMoveProbe = this.moveProbe();

            lastProbeCoords = {
                ...this.probePos,
                direction: this.probeDirection
            };

            if (!canMoveProbe) {
                break;
            }

            if (
                probeCoords.find(
                    (x) =>
                        x.x == lastProbeCoords.x &&
                        x.y == lastProbeCoords.y &&
                        x.direction == lastProbeCoords.direction
                )
            ) {
                return true;
            }
            probeCoords.push(lastProbeCoords);
        } while (canMoveProbe);

        return false;
    }

    private moveProbe() {
        if (!this.isPointInBounds(this.probePos)) {
            return false;
        }

        const nextCell = this.getNextCell(this.probePos, this.probeDirection);

        if (nextCell == null) {
            return false;
        }

        if (!nextCell.nextVal) {
            this.probeDirection = this.getNextDirection(this.probeDirection);
        } else {
            switch (this.probeDirection) {
                case Direction.Down:
                    this.probePos.y -= 1;
                    break;
                case Direction.Up:
                    this.probePos.y += 1;
                    break;
                case Direction.Left:
                    this.probePos.x += 1;
                    break;
                case Direction.Right:
                    this.probePos.x -= 1;
                    break;
            }
        }

        return true;
    }

    //#endregion
}

async function getMap() {
    return await parse('tasks\\data\\6.txt', (x) => {
        const map = new GameMap(x.split('\n').map((y) => y.trim()));
        return map;
    });
}

export async function pt1() {
    const map = await getMap();

    let canMove = true;
    do {
        canMove = map.movePlayer();
    } while (canMove);

    return map.pointsVisited.length;
}
export async function pt2() {
    const map = await getMap();
    let canMove = true;

    do {
        canMove = map.movePlayer();
    } while (canMove);

    const points = [...map.pointsVisited];
    points.shift();

    let loopCount = 0;
    for (const visitedPoint of points) {
        if (map.probe(visitedPoint)) {
            loopCount += 1;
        }
    }
    return loopCount;
}
