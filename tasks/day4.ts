import { parse } from '../util/parse';

function countXMAS(data: string[]) {
    const rowLength = data[0].length;
    const phraseLastIndex = 3;

    const matrix = data.flatMap((x) => x.split(''));
    const result = matrix
        .map((_, i) => {
            const rowPos = i % rowLength;

            const column = [
                matrix[i],
                matrix[i + rowLength],
                matrix[i + rowLength * 2],
                matrix[i + rowLength * 3]
            ];

            const placesToCheck: string[][] = [column];

            if (rowPos + phraseLastIndex < rowLength) {
                const row = [
                    matrix[i],
                    matrix[i + 1],
                    matrix[i + 2],
                    matrix[i + 3]
                ];

                const diagDownRight = [
                    matrix[i],
                    matrix[i + rowLength + 1],
                    matrix[i + rowLength * 2 + 2],
                    matrix[i + rowLength * 3 + 3]
                ];

                placesToCheck.push(row);
                placesToCheck.push(diagDownRight);
            }
            if (rowPos - phraseLastIndex >= 0) {
                const diagDownLeft = [
                    matrix[i],
                    matrix[i + rowLength - 1],
                    matrix[i + rowLength * 2 - 2],
                    matrix[i + rowLength * 3 - 3]
                ];

                placesToCheck.push(diagDownLeft);
            }

            return placesToCheck
                .map((x) => x.join(''))
                .map((x) => Number(x == 'XMAS' || x == 'SAMX'))
                .reduce((prev, curr) => prev + curr);
        })
        .reduce((x, y) => x + y);

    return result;
}

function countX_MAS(data: string[]) {
    const rowLength = data[0].length;
    const matrix = data.flatMap((x) => x.split(''));

    const indexesOfLetterA = matrix
        .map((letter, index) => {
            const res =
                letter == 'A' &&
                index >= rowLength &&
                (index % rowLength) + 1 < rowLength &&
                (index % rowLength) - 1 >= 0 &&
                index <= matrix.length - rowLength
                    ? index
                    : null;
            return res;
        })
        .filter((x) => x != null);

    return indexesOfLetterA
        .map((i) => {
            const words = [
                matrix[i - rowLength - 1] +
                    matrix[i] +
                    matrix[i + rowLength + 1],
                matrix[i - rowLength + 1] +
                    matrix[i] +
                    matrix[i + rowLength - 1]
            ];
            return words
                .map((x) => x == 'MAS' || x == 'SAM')
                .reduce((curr, prev) => curr && prev);
        })
        .filter((x) => x).length;
}

export async function pt1() {
    const input = await parse('tasks\\data\\4.txt', (x) =>
        x.trim().split('\n')
    );

    return countXMAS(input);
}

export async function pt2() {
    const input = await parse('tasks\\data\\4.txt', (x) =>
        x.trim().split('\n')
    );

    return countX_MAS(input);
}
