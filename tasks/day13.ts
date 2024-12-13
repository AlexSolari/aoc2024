import { lusolve } from 'mathjs';
import { parse } from '../util/parse';

async function getData(pt1: boolean) {
    return await parse('tasks\\data\\13.txt', (x) => {
        x = x.replaceAll('\r\n', '\n');

        return x
            .trim()
            .split('\n\n')
            .map((y) => {
                const [a, b, prize] = y
                    .split('\n')
                    .map((z) => z.trim().split(': ')[1]);

                return {
                    a: a.split(', ').map((x) => Number(x.split('+')[1])),
                    b: b.split(', ').map((x) => Number(x.split('+')[1])),
                    prize: prize
                        .split(', ')
                        .map((x) =>
                            pt1
                                ? Number(x.split('=')[1])
                                : 10000000000000 + Number(x.split('=')[1])
                        )
                };
            });
    });
}

function getResult(a: number[], b: number[], prize: number[], part1: boolean) {
    const precision = part1 ? 11 : 15; //god have mercy on javascript number type

    const res = lusolve(
        [
            [a[0], b[0]],
            [a[1], b[1]]
        ],
        [prize[0], prize[1]]
    )
        .flat()
        .map((x) => Number((x.valueOf() as number).toPrecision(precision)));

    const isResultInteger =
        Number.isInteger(res[0]) && Number.isInteger(res[1]);
    const canDo = part1
        ? isResultInteger && res[0] <= 100 && res[1] <= 100
        : isResultInteger;

    res[0] *= 3;

    return {
        canDo,
        price: res[0] + res[1]
    };
}

export async function pt1() {
    return (await getData(true))
        .map(({ a, b, prize }) => getResult(a, b, prize, true))
        .filter((x) => x.canDo)
        .map((x) => x.price)
        .reduce((x, y) => x + y);
}

export async function pt2() {
    return (await getData(false))
        .map(({ a, b, prize }) => getResult(a, b, prize, false))
        .filter((x) => x.canDo)
        .map((x) => x.price)
        .reduce((x, y) => x + y);
}
