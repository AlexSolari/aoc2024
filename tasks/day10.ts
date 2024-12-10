import { ObjectSet } from '../util/objectSet';
import { parse } from '../util/parse';

interface UnlinkedNodeData {
    value: number;
    x: number;
    y: number;
}

class Node {
    value: number;
    x!: number;
    y!: number;

    up: Node | undefined;
    down: Node | undefined;
    left: Node | undefined;
    right: Node | undefined;

    constructor(value: number) {
        this.value = value;
    }

    setCoords(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getNext() {
        return [this.up, this.down, this.left, this.right].filter(
            (x) => x != undefined && x.value == this.value + 1
        ) as Node[];
    }

    get unlinked(): UnlinkedNodeData {
        return {
            value: this.value,
            x: this.x,
            y: this.y
        };
    }
}

class TraverseResult {
    node: UnlinkedNodeData;
    path: TraverseResult[];

    constructor(value: UnlinkedNodeData, path?: TraverseResult[]) {
        this.node = value;
        this.path = path ??= [];
    }
}

function buildTree(root: Node): TraverseResult[] {
    const options = root.getNext();

    if (options.length == 0) return [new TraverseResult(root.unlinked, [])];

    return [
        new TraverseResult(
            root.unlinked,
            options.map((x) => new TraverseResult(root.unlinked, buildTree(x)))
        )
    ];
}

function find(root: TraverseResult): TraverseResult[] {
    if (root.node.value == 9) return [root];

    if (root.path.length == 0) return [];

    return root.path.flatMap((leaf) => find(leaf));
}

function getData() {
    return parse('tasks\\data\\10.txt', (input) => {
        const grid = input
            .trim()
            .split('\n')
            .map((x) =>
                x
                    .trim()
                    .split('')
                    .map((c) => new Node(Number(c)))
            );
        const possibleStarts: Node[] = [];
        const maxCoord = grid[0].length - 1;

        let y = 0;
        for (const row of grid) {
            let x = 0;
            for (const cell of row) {
                cell.setCoords(x, y);

                if (x > 0) {
                    cell.left = grid[y][x - 1];
                }
                if (x < maxCoord) {
                    cell.right = grid[y][x + 1];
                }
                if (y > 0) {
                    cell.up = grid[y - 1][x];
                }
                if (y < maxCoord) {
                    cell.down = grid[y + 1][x];
                }

                if (cell.value == 0) {
                    possibleStarts.push(cell);
                }

                x += 1;
            }
            y += 1;
        }

        return possibleStarts;
    });
}

async function solve(part1: boolean) {
    const possibleStarts = await getData();

    return possibleStarts
        .map((start) => {
            const tree = buildTree(start)[0];
            const nodes = find(tree).map((x) => x.node);

            return part1 ? new ObjectSet(nodes).length : nodes.length;
        })
        .reduce((x, y) => x + y);
}

export async function pt1() {
    return await solve(true);
}

export async function pt2() {
    return await solve(false);
}
