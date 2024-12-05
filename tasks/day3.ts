import { parse } from '../util/parse';

const mulRegEx = /mul\((\d{1,3}),(\d{1,3})\)/g;
const mulWithTogglesRegEx =
    /(?:mul\((\d{1,3}),(\d{1,3})\))|(do\(\))|(don't\(\))/g;

export async function pt1() {
    const input = await parse('tasks\\data\\3.txt', (x) => x.trim());
    const results = [...input.matchAll(mulRegEx)];

    return results
        .map(([_, arg1, arg2]) => Number(arg1) * Number(arg2))
        .reduce((curr, prev) => curr + prev);
}
export async function pt2() {
    const input = await parse('tasks\\data\\3.txt', (x) => x.trim());
    const results = [...input.matchAll(mulWithTogglesRegEx)];
    let doMul = true;

    return results
        .map(([mode, arg1, arg2]) => {
            if (mode == "don't()") {
                doMul = false;
                return 0;
            } else if (mode == 'do()') {
                doMul = true;
                return 0;
            }

            return doMul ? Number(arg1) * Number(arg2) : 0;
        })
        .reduce((curr, prev) => curr + prev);
}
