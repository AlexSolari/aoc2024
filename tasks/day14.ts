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

async function getData(pt1: boolean) {
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

export async function pt1() {
    const robots = await getData(true);

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
    // checked a 100 first iteration, emerging pattern was occuring at 77 + 101*N seconds
    // printed a 100 of thoose seconds and easter egg was on this secondd
    const answer = 7753;
    const robots = await getData(true);

    robots.forEach((r) => r.move(answer));
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

    Bun.write(
        'tasks\\data\\out\\14.txt',
        map
            .map((x) => x.join(''))
            .join('\n')
            .replaceAll('0', '.')
    );

    return answer;
}
