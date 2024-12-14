import { parse } from '../util/parse';
import { Point, Vector } from '../util/point';

// const maxX = 11;
// const maxY = 7;
const maxX = 101;
const maxY = 103;

class Robot {
    position: Point;
    velocity: Vector;

    constructor(pX: number, pY: number, vX: number, vY: number) {
        this.position = new Point(pX, pY);
        this.velocity = new Vector(vX, vY);
    }

    move(times: number) {
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

            if (value == 0) valuesInARow = 0;
            valuesInARow += 1;

            rowDensity += 2 ** (valuesInARow - 1) - 1;
        }
    }

    let columnDensity = 0;

    for (let rY = 0; rY < rowLength; rY++) {
        let valuesInARow = 0;
        for (let rX = 0; rX < colLength; rX++) {
            const value = matrix[rX][rY];

            if (value == undefined) console.log(rX, rY);
            if (value == 0) valuesInARow = 0;
            valuesInARow += 1;

            columnDensity += 2 ** (valuesInARow - 1) - 1;
        }
    }

    return rowDensity + columnDensity;
}

export async function pt1() {
    const robots = await getData();

    robots.forEach((r) => r.move(100));

    const map: number[][] = [];
    for (let y = 0; y < maxY; y++) {
        const row: number[] = [];

        for (let x = 0; x < maxX; x++) {
            row.push(
                robots.filter((r) => r.position.x == x && r.position.y == y)
                    .length
            );
        }

        map.push(row);
    }

    const robotsInQ1 = robots.filter(
        (r) => r.position.x < (maxX - 1) / 2 && r.position.y < (maxY - 1) / 2
    ).length;
    const robotsInQ2 = robots.filter(
        (r) => r.position.x > (maxX - 1) / 2 && r.position.y < (maxY - 1) / 2
    ).length;
    const robotsInQ3 = robots.filter(
        (r) => r.position.x < (maxX - 1) / 2 && r.position.y > (maxY - 1) / 2
    ).length;
    const robotsInQ4 = robots.filter(
        (r) => r.position.x > (maxX - 1) / 2 && r.position.y > (maxY - 1) / 2
    ).length;

    return [robotsInQ1, robotsInQ2, robotsInQ3, robotsInQ4].reduce(
        (x, y) => x * y
    );
}

export async function pt2() {
    const robots = await getData();
    const map: number[][] = [];

    for (let y = 0; y < maxY; y++) {
        const row: number[] = [];
        for (let x = 0; x < maxX; x++) {
            row.push(0);
        }
        map.push(row);
    }

    const densities = [];

    for (let index = 0; index < 10_000; index++) {
        robots.forEach((r) => (map[r.position.x][r.position.y] = 0));
        robots.forEach((r) => r.move(1));
        robots.forEach((r) => (map[r.position.x][r.position.y] += 1));
        densities.push(getDensity(map));
    }

    //avg density of randomly distributed robots is hovering around 1000, and in case of emerging pattern its around 1300
    const outliers = densities
        .map((density, index) => ({
            density,
            second: index + 1
        }))
        .filter((x) => x.density > 2000);

    return outliers;
}
