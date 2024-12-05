import { parse } from '../util/parse';

class Rule {
    page1: number;
    page2: number;

    constructor(p1: number, p2: number) {
        this.page1 = p1;
        this.page2 = p2;
    }

    isSatisfied(arr: number[]) {
        const i2 = arr.indexOf(this.page2);
        const i1 = arr.indexOf(this.page1);
        return { satisfies: i1 == -1 || i2 == -1 || i2 > i1, i1, i2 };
    }

    fix(arr: number[]) {
        const checkResult = this.isSatisfied(arr);

        if (checkResult.satisfies) return;

        [arr[checkResult.i1], arr[checkResult.i2]] = [
            arr[checkResult.i2],
            arr[checkResult.i1]
        ];
    }
}

async function getInput() {
    return await parse('tasks\\data\\5.txt', (x) => {
        const [rules, input] = x.trim().replaceAll('\r', '').split('\n\n');

        return {
            rules: rules
                .split('\n')
                .map((rule) => rule.split('|').map((n) => Number(n)))
                .toSorted(([x2, x1], [y2, y1]) => {
                    if (x1 != y1) return x1 - y1;

                    return x2 - y2;
                })
                .map(([p1, p2]) => new Rule(p1, p2)),
            input: input
                .split('\n')
                .map((i) => i.split(',').map((y) => Number(y)))
        };
    });
}

export async function pt1() {
    const { rules, input } = await getInput();

    return input
        .filter((arr) =>
            rules
                .map((rule) => rule.isSatisfied(arr).satisfies)
                .reduce((x, y) => x && y)
        )
        .map((arr) => arr[Math.floor(arr.length / 2)])
        .reduce((x, y) => x + y);
}

export async function pt2() {
    const { rules, input } = await getInput();

    const initialIncorrectInputs = input.filter(
        (arr) =>
            !rules
                .map((rule) => rule.isSatisfied(arr).satisfies)
                .reduce((x, y) => x && y)
    );

    let fixedInputs = [...initialIncorrectInputs];
    let incorrectCount = -1;
    while (incorrectCount != 0) {
        fixedInputs = fixedInputs.map((arr) => {
            rules.forEach((rule) => rule.fix(arr));

            return arr;
        });

        incorrectCount = fixedInputs.filter(
            (arr) =>
                !rules
                    .map((rule) => rule.isSatisfied(arr).satisfies)
                    .reduce((x, y) => x && y)
        ).length;
    }

    return fixedInputs
        .map((arr) => arr[Math.floor(arr.length / 2)])
        .reduce((x, y) => x + y);
}
