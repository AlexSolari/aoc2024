import { parse } from '../util/parse';

enum Direction {
    Up,
    Right,
    Down,
    Left
}

interface DirectionalPoint {
    x: number;
    y: number;
    direction: Direction;
}

class GameMap extends Array<Array<boolean>> {
    maxX = 0;
    maxY = 0;

    playerX = 0;
    playerY = 0;
    playerDirection = Direction.Down;

    probeX = 0;
    probeY = 0;
    probeDirection = Direction.Down;

    obstacleX = 0;
    obstacleY = 0;

    pointsVisited: DirectionalPoint[] = [];

    possibleLoops: [number, number][] = [];

    constructor(data: string[]) {
        super();

        data.forEach((row, i) => {
            this[i] = [];
            row.split('').forEach((cell, i2) => {
                if (cell == '^') {
                    this.playerX = this.probeX = i2;
                    this.playerY = this.probeY = i;

                    this.pointsVisited.push({
                        x: this.playerX,
                        y: this.playerY,
                        direction: this.playerDirection
                    } as DirectionalPoint);
                }

                this[i][i2] = cell != '#';
            });
        });

        this.maxY = this.length - 1;
        this.maxX = this[0].length - 1;
    }

    getNextCell(x: number, y: number, direction: Direction) {
        let nextX = x;
        let nextY = y;
        let nextVal = true;
        switch (direction) {
            case Direction.Down:
                nextY = y - 1;

                if (nextY < 0 || nextX < 0 || nextX > this.maxX) {
                    break;
                }
                nextVal = this[nextY][nextX];
                break;
            case Direction.Up:
                nextY = y + 1;
                if (nextY > this.maxY || nextX < 0 || nextX > this.maxX) {
                    break;
                }

                nextVal = this[nextY][nextX];
                break;
            case Direction.Left:
                nextX = x + 1;
                if (nextX > this.maxX || nextY < 0 || nextY > this.maxX) {
                    break;
                }

                nextVal = this[nextY][nextX];
                break;
            case Direction.Right:
                nextX = x - 1;
                if (nextX < 0 || nextY < 0 || nextY > this.maxX) {
                    break;
                }

                nextVal = this[nextY][nextX];
                break;
        }

        return { nextX, nextY, nextVal };
    }

    getNextDirection(direction: Direction) {
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

    movePlayer(launchProbe: boolean) {
        if (
            !(
                this.playerX <= this.maxX &&
                this.playerY <= this.maxY &&
                this.playerX >= 0 &&
                this.playerY >= 0
            )
        ) {
            return false;
        }

        const nextCell = this.getNextCell(
            this.playerX,
            this.playerY,
            this.playerDirection
        );

        this.probeX = this.playerX;
        this.probeY = this.playerY;
        this.probeDirection = this.playerDirection;

        if (!nextCell.nextVal) {
            this.playerDirection = this.getNextDirection(this.playerDirection);
        } else {
            switch (this.playerDirection) {
                case Direction.Down:
                    this.playerY -= 1;
                    break;
                case Direction.Up:
                    this.playerY += 1;
                    break;
                case Direction.Left:
                    this.playerX += 1;
                    break;
                case Direction.Right:
                    this.playerX -= 1;
                    break;
            }

            const pointCoords = {
                x: this.playerX,
                y: this.playerY,
                direction: this.playerDirection
            } as DirectionalPoint;
            if (
                this.pointsVisited.find(
                    (p) => p.x == pointCoords.x && p.y == pointCoords.y
                ) == undefined
            ) {
                this.pointsVisited.push(pointCoords);
            }

            if (launchProbe) {
                const obstacle = this.getNextCell(
                    this.playerX,
                    this.playerY,
                    this.playerDirection
                );

                if (obstacle.nextVal) {
                    this.obstacleX = obstacle.nextX;
                    this.obstacleY = obstacle.nextY;

                    this.launchProbe();
                }
            }
        }

        return true;
    }

    private launchProbe() {
        const probeCoords: DirectionalPoint[] = [];
        let lastProbeCoords: DirectionalPoint;
        let canMoveProbe = true;
        /*console.log('launching probe, obstacle at ', [
            this.obstacleX,
            this.obstacleY
        ]);*/
        do {
            canMoveProbe = this.moveProbe();
            //console.log('probe at ', [this.probeX, this.probeY]);
            lastProbeCoords = {
                x: this.probeX,
                y: this.probeY,
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
                if (
                    !this.possibleLoops.find(
                        (lp) =>
                            lp[0] == this.obstacleX && lp[1] == this.obstacleY
                    )
                ) {
                    //console.log('loop:', [this.obstacleX, this.obstacleY]);
                    this.possibleLoops.push([this.obstacleX, this.obstacleY]);
                    //console.log(this.possibleLoops.length);
                }

                break;
            }
            probeCoords.push(lastProbeCoords);
        } while (canMoveProbe);

        //console.log('probe finished');
    }

    moveProbe() {
        if (
            !(
                this.probeX <= this.maxX &&
                this.probeY <= this.maxY &&
                this.probeX >= 0 &&
                this.probeY >= 0
            )
        ) {
            return false;
        }

        const nextCell = this.getNextCell(
            this.probeX,
            this.probeY,
            this.probeDirection
        );

        if (
            !nextCell.nextVal ||
            (nextCell.nextX == this.obstacleX &&
                nextCell.nextY == this.obstacleY)
        ) {
            this.probeDirection = this.getNextDirection(this.probeDirection);
        } else {
            switch (this.probeDirection) {
                case Direction.Down:
                    this.probeY -= 1;
                    break;
                case Direction.Up:
                    this.probeY += 1;
                    break;
                case Direction.Left:
                    this.probeX += 1;
                    break;
                case Direction.Right:
                    this.probeX -= 1;
                    break;
            }
        }

        return true;
    }
}

async function getMap(launchProbe: boolean) {
    return await parse('tasks\\data\\6.txt', (x) => {
        const map = new GameMap(x.split('\n').map((y) => y.trim()));

        while (map.movePlayer(launchProbe)) {}
        map.pointsVisited.pop();

        return map;
    });
}

export async function pt1() {
    const map = await getMap(false);

    return map.pointsVisited.length;
}
export async function pt2() {
    //const map = await getMap(true);
    //return map.possibleLoops.length;
}
