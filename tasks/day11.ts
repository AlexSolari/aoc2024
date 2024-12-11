import { parse } from '../util/parse';

async function getData() {
    return await parse('tasks\\data\\11.txt', (x) =>
        x
            .trim()
            .split(' ')
            .map((p) => Number(p))
    );
}

const pebbleCache: Record<number, number[]> = {};
pebbleCache[0] = [1];

function process(pebble: number): number[] {
    const pebbleString = pebble.toString();
    if (pebbleString.length % 2 == 0) {
        const result = [
            Number(pebbleString.slice(0, pebbleString.length / 2)),
            Number(
                pebbleString.slice(pebbleString.length / 2, pebbleString.length)
            )
        ];

        pebbleCache[pebble] = result;
        return result;
    }

    const next = [pebble * 2024];
    pebbleCache[pebble] = next;
    return next;
}

function solve3(data: number[], count: number) {
    const numberCounts: Record<number, number> = {};

    function increaseCount(x: number, val: number) {
        numberCounts[x] = (numberCounts[x] ?? 0) + val;
    }

    data.forEach((x) => increaseCount(x, 1));

    do {
        Object.entries(numberCounts)
            .filter((x) => x != undefined)
            .map(([strIndex, count]) => {
                const number = Number(strIndex);

                delete numberCounts[number];

                return { number, count };
            })
            .forEach((numberInfo) => {
                if (!pebbleCache[numberInfo.number]) {
                    process(numberInfo.number);
                }

                pebbleCache[numberInfo.number].forEach((n) => {
                    increaseCount(n, numberInfo.count);
                });
            });
        count--;
    } while (count > 0);

    return Object.values(numberCounts).reduce((x, y) => x + y);
}

export async function pt1() {
    return solve3(await getData(), 25);
}

export async function pt2() {
    return solve3(await getData(), 75);
}
