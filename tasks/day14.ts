import { parse } from '../util/parse';
import { Point, Vector } from '../util/point';

const maxX = 101;
const maxY = 103;

class Robot {
    position: Point;
    velocity: Vector;
    stepsTaken = 0;

    constructor(pX: number, pY: number, vX: number, vY: number) {
        this.position = new Point(pX, pY);
        this.velocity = new Vector(vX, vY);
    }

    move(times: number) {
        this.stepsTaken += times;
        this.position.x += this.velocity.x * times;
        this.position.y += this.velocity.y * times;

        if (this.position.x < 0)
            this.position.x = maxX + (this.position.x % maxX);
        if (this.position.y < 0)
            this.position.y = maxY + (this.position.y % maxY);
        if (this.position.x >= maxX) this.position.x = this.position.x % maxX;
        if (this.position.y >= maxY) this.position.y = this.position.y % maxY;
    }
}

async function getData() {
    return await parse('tasks\\data\\14.txt', (x) =>
        x
            .split('\n')
            .map((x) =>
                x.split(' ').map((part) => part.trim().split('=')[1].trim())
            )
            .map(([p, v]) => {
                const [pX, pY] = p.split(',').map((x) => Number(x));
                const [vX, vY] = v.split(',').map((x) => Number(x));

                return new Robot(pX, pY, vX, vY);
            })
    );
}

function getDensity(matrix: number[][]) {
    let rowDensity = 0;
    const colLength = maxY;
    const rowLength = maxX;

    for (let rY = 0; rY < colLength; rY++) {
        let valuesInARow = 0;
        for (let rX = 0; rX < rowLength; rX++) {
            const value = matrix[rY][rX];

            if (!value) valuesInARow = 0;
            valuesInARow += 1;

            rowDensity += 2 ** (valuesInARow - 1) - 1;
        }
    }

    let columnDensity = 0;

    for (let rY = 0; rY < rowLength; rY++) {
        let valuesInARow = 0;
        for (let rX = 0; rX < colLength; rX++) {
            const value = matrix[rX][rY];

            if (!value) valuesInARow = 0;
            valuesInARow += 1;

            columnDensity += 2 ** (valuesInARow - 1) - 1;
        }
    }

    return rowDensity + columnDensity;
}

export async function pt1() {
    const robots = await getData();

    robots.forEach((r) => r.move(100));

    let robotsInQ1 = 0,
        robotsInQ2 = 0,
        robotsInQ3 = 0,
        robotsInQ4 = 0;

    robots.forEach((r) => {
        if (r.position.x < (maxX - 1) / 2 && r.position.y < (maxY - 1) / 2)
            robotsInQ1++;
        else if (r.position.x > (maxX - 1) / 2 && r.position.y < (maxY - 1) / 2)
            robotsInQ2++;
        else if (r.position.x < (maxX - 1) / 2 && r.position.y > (maxY - 1) / 2)
            robotsInQ3++;
        else if (r.position.x > (maxX - 1) / 2 && r.position.y > (maxY - 1) / 2)
            robotsInQ4++;
    });

    return robotsInQ1 * robotsInQ2 * robotsInQ3 * robotsInQ4;
}

export async function pt2() {
    const robots = await getData();
    const map: number[][] = [];

    for (let y = 0; y < maxY; y++) {
        const row = new Array<number>(maxX);
        map.push(row);
    }

    let maxDensity = 0;
    let maxDensitySteps = 0;
    let step = 1;

    //avg density of randomly distributed robots is hovering around 900-1000, and in case of emerging pattern its around 1400-2000
    for (let index = 0; index <= 100; index += step) {
        robots.forEach((r) => (map[r.position.x][r.position.y] = 0));
        robots.forEach((r) => r.move(step));
        robots.forEach((r) => (map[r.position.x][r.position.y] += 1));

        const density = getDensity(map);

        if (density > maxDensity) {
            maxDensity = density;
            maxDensitySteps = robots[0].stepsTaken;
        }
    }

    //pattern emerges every 101 steps with some initial offset
    const offset = maxDensitySteps;
    step = 101;
    robots.forEach((r) => r.move(offset - step));

    for (let index = offset; index < 10_000; index += step) {
        robots.forEach((r) => (map[r.position.x][r.position.y] = 0));
        robots.forEach((r) => r.move(step));
        robots.forEach((r) => (map[r.position.x][r.position.y] += 1));

        const density = getDensity(map);

        if (density > maxDensity) {
            maxDensity = density;
            maxDensitySteps = robots[0].stepsTaken;
        }
    }

    return { maxDensity, steps: maxDensitySteps };
}
