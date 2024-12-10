import { ObjectSet } from '../util/objectSet';
import { parse } from '../util/parse';

interface CellData {
    value: number;
    x: number;
    y: number;
}

class GridCell {
    value: number;
    x!: number;
    y!: number;

    cellData!: CellData;
    next: GridCell[] = [];

    constructor(value: number) {
        this.value = value;
    }

    setCoords(x: number, y: number) {
        this.x = x;
        this.y = y;

        this.cellData = {
            value: this.value,
            x: this.x,
            y: this.y
        };
    }
}

class TreeNode {
    node: CellData;
    children: TreeNode[];

    constructor(value: CellData, path?: TreeNode[]) {
        this.node = value;
        this.children = path ??= [];
    }
}

function buildTree(root: GridCell): TreeNode {
    if (root.next.length == 0) return new TreeNode(root.cellData);

    return new TreeNode(
        root.cellData,
        root.next.map((x) => new TreeNode(x.cellData, [buildTree(x)]))
    );
}

function find9(root: TreeNode): TreeNode[] {
    if (root.node.value == 9) return [root];

    if (root.children.length == 0) return [];

    return root.children.flatMap((child) => find9(child));
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
                    .map((c) => new GridCell(Number(c)))
            );
        const possibleStarts: GridCell[] = [];
        const maxCoord = grid[0].length - 1;

        for (let y = 0; y <= maxCoord; y++) {
            for (let x = 0; x <= maxCoord; x++) {
                const cell = grid[y][x];

                cell.setCoords(x, y);

                if (x > 0 && grid[y][x - 1].value == cell.value + 1) {
                    cell.next.push(grid[y][x - 1]);
                }
                if (x < maxCoord && grid[y][x + 1].value == cell.value + 1) {
                    cell.next.push(grid[y][x + 1]);
                }
                if (y > 0 && grid[y - 1][x].value == cell.value + 1) {
                    cell.next.push(grid[y - 1][x]);
                }
                if (y < maxCoord && grid[y + 1][x].value == cell.value + 1) {
                    cell.next.push(grid[y + 1][x]);
                }

                if (cell.value == 0) {
                    possibleStarts.push(cell);
                }
            }
        }

        return possibleStarts;
    });
}

async function solve(part1: boolean) {
    const possibleStarts = await getData();

    return possibleStarts
        .map((start) => {
            const tree = buildTree(start);
            const nodes = find9(tree).map((x) => x.node);

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
