import { parse } from '../util/parse';

async function getLists() {
    return await parse('tasks\\data\\2.txt', (raw) =>
        raw
            .trim()
            .split('\n')
            .map((row) =>
                row
                    .trim()
                    .split(' ')
                    .map((n) => Number.parseInt(n.trim()))
            )
    );
}

function isSafe(report: number[]) {
    const isDescending = report[0] > report[1];
    let prev: number;

    const checkPair: (prev: number, curr: number) => boolean = isDescending
        ? (prev, curr) => {
              if (curr >= prev) return true;
              return prev - curr > 3;
          }
        : (prev, curr) => {
              if (curr <= prev) return true;
              return curr - prev > 3;
          };

    for (let i = 1; i < report.length; i++) {
        const curr = report[i];
        prev = report[i - 1];

        if (checkPair(prev, curr)) {
            return false;
        }
    }

    return true;
}

function isSafeWithDampener(report: number[]) {
    if (isSafe(report)) return true;

    for (let i = 0; i < report.length; i++) {
        const copy = [...report];
        copy.splice(i, 1);

        if (isSafe(copy)) {
            return true;
        }
    }

    return false;
}

export async function pt1() {
    return (await getLists())
        .map((x) => Number(isSafe(x)))
        .reduce((prev, curr) => prev + curr);
}
export async function pt2() {
    return (await getLists())
        .map((x) => Number(isSafeWithDampener(x)))
        .reduce((prev, curr) => prev + curr);
}
