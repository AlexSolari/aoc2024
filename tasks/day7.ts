import { parse } from '../util/parse';

enum OperationPlusMul {
    Add,
    Mul
}

enum OperationPlusMulConcat {
    Add,
    Mul,
    Concat
}

function generateCombinations_1(size: number) {
    const totalCombinations = 2 ** size;
    const combinations: OperationPlusMul[][] = [];

    for (let i = 0; i < totalCombinations; i++) {
        const combination: OperationPlusMul[] = [];

        for (let j = 0; j < size; j++) {
            const state =
                (i & (1 << j)) !== 0
                    ? OperationPlusMul.Add
                    : OperationPlusMul.Mul;
            combination.push(state);
        }

        combinations.push(combination);
    }

    return combinations;
}

function generateCombinations_2(size: number) {
    const totalCombinations = 3 ** size;
    const combinations: OperationPlusMulConcat[][] = [];

    for (let i = 0; i < totalCombinations; i++) {
        const combination: OperationPlusMulConcat[] = [];

        let index = i;
        for (let j = 0; j < size; j++) {
            const state = index % 3;
            combination.push(state as OperationPlusMulConcat);
            index = Math.floor(index / 3);
        }

        combinations.push(combination);
    }

    return combinations;
}

function concatNumbers(x: number, y: number) {
    return Number(x.toString() + y.toString());
}

async function getData() {
    return await parse('tasks\\data\\7.txt', (x) => {
        return x
            .trim()
            .split('\n')
            .map((r) => {
                const [target, values] = r.trim().split(': ');

                return {
                    target: Number(target),
                    values: values.split(' ').map((y) => Number(y))
                };
            });
    });
}

export async function pt1() {
    const data = await getData();
    const ops = data.map((x) => {
        const combinations = generateCombinations_1(x.values.length - 1);

        return combinations
            .map((comb) => {
                let res = '';
                for (let i = 0; i < x.values.length; i++) {
                    const element = x.values[i];

                    res += `${element}`;

                    if (i != 0) {
                        res = '(' + res + ')';
                    }

                    if (i < comb.length) {
                        res += comb[i] == OperationPlusMul.Add ? '+' : '*';
                    }
                }

                return eval(res) as number;
            })
            .find((val) => val == x.target);
    });

    return ops.filter((x) => x != undefined).reduce((x, y) => x + y);
}

export async function pt2() {
    const data = await getData();
    const ops = data.map((x) => {
        const combinations = generateCombinations_2(x.values.length - 1);

        return combinations
            .map((comb) => {
                let res = '';
                let concatWasUsedLastTime = false;
                for (let i = 0; i < x.values.length; i++) {
                    const element = x.values[i];

                    res += `${element}`;

                    if (i != 0) {
                        res = '(' + res + ')';
                    }

                    if (concatWasUsedLastTime) {
                        res = 'concatNumbers' + res;
                        concatWasUsedLastTime = false;
                    }

                    if (i < comb.length) {
                        res +=
                            comb[i] == OperationPlusMulConcat.Add
                                ? '+'
                                : comb[i] == OperationPlusMulConcat.Mul
                                ? '*'
                                : ((concatWasUsedLastTime = true), ',');
                    }
                }

                return eval(res) as number;
            })
            .find((val) => val == x.target);
    });

    return ops.filter((x) => x != undefined).reduce((x, y) => x + y);
}
