import { parse } from '../util/parse';

export async function pt1() {
    const { list1, list2 } = await getLists();

    list1.sort();
    list2.sort();

    const result = list2
        .map((curr, index) => Math.abs(list1[index] - curr))
        .reduce((prev, curr) => prev + curr);

    return result;
}

export async function pt2() {
    const { list1, list2 } = await getLists();

    const similarityScoresMultipliers: Record<number, number> = {};

    list2.forEach((x) => {
        similarityScoresMultipliers[x] =
            (similarityScoresMultipliers[x] ?? 0) + 1;
    });

    const result = list1
        .map((curr) => curr * (similarityScoresMultipliers[curr] ?? 0))
        .reduce((prev, curr) => prev + curr);

    return result;
}

async function getLists() {
    const list1: number[] = [];
    const list2: number[] = [];
    await parse('tasks\\data\\1.txt', (raw) => {
        const rows = raw.split('\n');
        rows.forEach((row) => {
            const [first, second] = row.split('   ');

            if (!first || !second) {
                return;
            }

            list1.push(Number.parseInt(first));
            list2.push(Number.parseInt(second));
        });
    });

    return { list1, list2 };
}
