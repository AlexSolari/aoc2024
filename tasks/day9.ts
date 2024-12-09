import { parse } from '../util/parse';

interface BlockData {
    startingIndex: number;
    blockLength: number;
}

interface FileData extends BlockData {
    id: number;
}

type NumberOrEmpty = number | undefined;
type FileIndexesData = NumberOrEmpty | FileData;
type EmptyIndexesData = number | BlockData;

async function getData(part2: boolean) {
    return await parse('tasks\\data\\9.txt', (x) => {
        const input = x
            .trim()
            .split('')
            .map((x) => Number(x));

        const totalSize = input.reduce((x, y) => x + y);
        const out = part2 ? [] : Array<FileIndexesData>(totalSize);
        const emptyIndexes: EmptyIndexesData[] = [];

        let leaveEmpty = false;
        let currectId = 0;
        let currentIndex = 0;

        for (const blockLength of input) {
            if (!leaveEmpty) {
                if (part2) {
                    out.push({
                        id: currectId,
                        startingIndex: currentIndex,
                        blockLength
                    });
                } else {
                    out.fill(
                        currectId,
                        currentIndex,
                        currentIndex + blockLength
                    );
                }
                currectId += 1;
            } else {
                if (part2) {
                    emptyIndexes.push({
                        startingIndex: currentIndex,
                        blockLength
                    });
                } else if (blockLength > 0) {
                    for (
                        let emptyIndex = currentIndex;
                        emptyIndex < currentIndex + blockLength;
                        emptyIndex++
                    ) {
                        emptyIndexes.push(emptyIndex);
                    }
                }
            }

            currentIndex += blockLength;
            leaveEmpty = !leaveEmpty;
        }

        return { out, emptyIndexes };
    });
}

export async function pt1() {
    const { out, emptyIndexes } = await getData(false);

    for (let index = out.length - 1; index > 0; index--) {
        const element = out[index] as NumberOrEmpty;

        if (element) {
            const firstEmptyIndex = (emptyIndexes as number[]).shift();

            if (firstEmptyIndex && index > firstEmptyIndex) {
                [out[firstEmptyIndex], out[index]] = [
                    out[index],
                    out[firstEmptyIndex]
                ];
                emptyIndexes.push(index);
            }
        }
    }

    return (out as NumberOrEmpty[])
        .filter((x) => x != undefined)
        .map((x, i) => x * i)
        .reduce((x, y) => x + y);
}

export async function pt2() {
    let { out, emptyIndexes } = await getData(true);
    for (let index = out.length - 1; index > 0; index--) {
        const element = out[index] as FileData;

        const firstEmptyIndexWithMatchingSize = (
            emptyIndexes as BlockData[]
        ).find(
            (x) =>
                x.blockLength >= element.blockLength &&
                x.startingIndex < element.startingIndex
        );

        if (firstEmptyIndexWithMatchingSize) {
            const oldIndex = element.startingIndex;
            emptyIndexes.unshift({
                blockLength: element.blockLength,
                startingIndex: oldIndex
            });

            element.startingIndex =
                firstEmptyIndexWithMatchingSize.startingIndex;

            const newEmptyLength =
                firstEmptyIndexWithMatchingSize.blockLength -
                element.blockLength;

            if (newEmptyLength > 0) {
                firstEmptyIndexWithMatchingSize.blockLength = newEmptyLength;
                firstEmptyIndexWithMatchingSize.startingIndex +=
                    element.blockLength;
            } else {
                const index = emptyIndexes.indexOf(
                    firstEmptyIndexWithMatchingSize
                );
                emptyIndexes.splice(index, 1);
            }
        }
    }

    return ([...out, ...emptyIndexes] as BlockData[])
        .toSorted((a, b) => a.startingIndex - b.startingIndex)
        .flatMap((x) => {
            if ('id' in x) {
                return Array<number>(x.blockLength).fill(x.id as number);
            }

            return Array<number>(x.blockLength).fill(0);
        })
        .map((x, i) => x * i)
        .reduce((x, y) => x + y);
}
