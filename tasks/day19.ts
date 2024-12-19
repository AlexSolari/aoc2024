import { parse } from '../util/parse';

const cache = new Map<string, number>();

function countVariants(pattern: string, patterns: string[]): number {
    if (cache.has(pattern)) return cache.get(pattern)!;

    if (!pattern) return 1;

    const result = patterns.reduce((sum, stripe) => {
        if (pattern.startsWith(stripe)) {
            return sum + countVariants(pattern.slice(stripe.length), patterns);
        }
        return sum;
    }, 0);

    cache.set(pattern, result);
    return result;
}

async function getData() {
    return await parse('tasks\\data\\19.txt', (input) => {
        const [patternsString, designsString] = input.split('\r\n\r\n');

        return {
            patterns: patternsString.split(', '),
            designs: designsString.split('\r\n')
        };
    });
}

export async function pt1() {
    const { patterns, designs } = await getData();

    let i = 0;
    for (let design of designs) {
        if (countVariants(design, patterns)) {
            i++;
        }
    }

    return i;
}

export async function pt2() {
    const { patterns, designs } = await getData();

    let i = 0;
    for (let design of designs) {
        i += countVariants(design, patterns);
    }

    return i;
}
