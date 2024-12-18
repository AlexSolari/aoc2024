import { ObjectSet } from '../util/objectSet';
import { parse } from '../util/parse';
import { Point, Vector } from '../util/point';

async function getData() {
    return await parse('tasks\\data\\8.txt', (x) => {
        const grid = x
            .trim()
            .split('\n')
            .map((x) => x.trim().split(''));
        const antennas = new Set(x.split(''));
        antennas.delete('.');
        antennas.delete('\n');
        antennas.delete('\r');

        const maxCoord = grid[0].length - 1;

        const antennasPositions: Record<string, Point[]> = {};
        for (const type of antennas.values()) {
            antennasPositions[type] = [];
        }

        for (let y = 0; y < grid.length; y++) {
            const row = grid[y];
            for (let x = 0; x < row.length; x++) {
                const element = row[x];

                if (antennas.has(element)) {
                    antennasPositions[element].push(Point.constant.from(x, y));
                }
            }
        }

        return { antennasPositions, maxCoord };
    });
}

export async function pt1() {
    const { antennasPositions, maxCoord } = await getData();
    const nodes = new ObjectSet<Point>();

    for (const key in antennasPositions) {
        const group = antennasPositions[key];

        for (const element of group) {
            for (const other of group) {
                if (other == element) continue;

                const vec = Vector.fromPoints(element, other);
                const node = other.add(vec);

                if (
                    node.x >= 0 &&
                    node.y >= 0 &&
                    node.x <= maxCoord &&
                    node.y <= maxCoord
                ) {
                    nodes.add(node);
                }
            }
        }
    }

    return [...nodes].length;
}
export async function pt2() {
    const { antennasPositions, maxCoord } = await getData();
    const nodes = new ObjectSet<Point>();

    for (const key in antennasPositions) {
        const group = antennasPositions[key];

        for (const element of group) {
            for (const other of group) {
                if (other == element) continue;

                const vec = Vector.fromPoints(element, other);
                let otherPos: Point = element;

                while (true) {
                    const node = (otherPos = otherPos.add(vec));

                    if (
                        node.x >= 0 &&
                        node.y >= 0 &&
                        node.x <= maxCoord &&
                        node.y <= maxCoord
                    ) {
                        nodes.add(node);
                    } else {
                        break;
                    }
                }
            }
        }
    }

    return [...nodes].length;
}
