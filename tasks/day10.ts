import { down, GridCell, left, right, up, value } from '../util/gridcell';
import { ObjectSet } from '../util/objectSet';
import { parse } from '../util/parse';
import { TreeNode } from '../util/treeNode';

function buildTree(root: GridCell<number>): TreeNode<GridCell<number>> {
    if (root.next.length == 0) return new TreeNode<GridCell<number>>(root);

    return new TreeNode<GridCell<number>>(
        root,
        root.next.map((x) => new TreeNode<GridCell<number>>(x, [buildTree(x)]))
    );
}

function find9(root: TreeNode<GridCell<number>>): TreeNode<GridCell<number>>[] {
    if (root.node[value] == 9) return [root];

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
                    .map((c) => new GridCell<number>(Number(c)))
            );
        const possibleStarts: GridCell<number>[] = [];
        const maxCoord = grid[0].length - 1;

        for (let y = 0; y <= maxCoord; y++) {
            for (let x = 0; x <= maxCoord; x++) {
                const cell = grid[y][x];

                cell.setCoords(x, y);

                if (x > 0 && grid[y][x - 1][value] == cell[value] + 1) {
                    cell[left] = grid[y][x - 1];
                }
                if (x < maxCoord && grid[y][x + 1][value] == cell[value] + 1) {
                    cell[right] = grid[y][x + 1];
                }
                if (y > 0 && grid[y - 1][x][value] == cell[value] + 1) {
                    cell[up] = grid[y - 1][x];
                }
                if (y < maxCoord && grid[y + 1][x][value] == cell[value] + 1) {
                    cell[down] = grid[y + 1][x];
                }

                if (cell[value] == 0) {
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
