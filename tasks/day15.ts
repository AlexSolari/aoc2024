import { Direction } from '../util/direction';
import { GridCell, up, down, left, right, value } from '../util/gridcell';
import { ObjectSet } from '../util/objectSet';
import { parse } from '../util/parse';
import { Point } from '../util/point';
import { TreeNode } from '../util/treeNode';

enum Values {
    EMPTY = '.',
    SMALL_BOX = 'O',
    ROBOT = '@',
    WALL = '#',

    BIG_BOX_LEFT = '[',
    BIG_BOX_RIGHT = ']'
}

class Warehouse {
    grid: GridCell<string>[][];
    directions: Direction[];
    isWide: boolean;

    robotPosition: Point;

    constructor(
        grid: GridCell<string>[][],
        directions: Direction[],
        robotPosition: Point,
        isWide: boolean
    ) {
        this.grid = grid;
        this.directions = directions;
        this.robotPosition = robotPosition;
        this.isWide = isWide;
    }

    move() {
        const direction = this.directions.shift();
        if (direction == undefined) return false;

        if (
            this.isWide &&
            (direction == Direction.Down || direction == Direction.Up)
        ) {
            const treeOfUpdates = this.getTreeOfUpdates(
                this.grid[this.robotPosition.y][this.robotPosition.x],
                direction
            );
            if (treeOfUpdates == null) return true;

            this.fixDuplicateBoxMovement(treeOfUpdates, direction);

            if (treeOfUpdates.isFlat()) {
                const chain = treeOfUpdates.flat().toReversed();
                this.performUpdatesFromChain(chain);
            } else {
                this.performUpdatesFromTree(treeOfUpdates, direction);
            }
        } else {
            const next = this.getNext(direction);
            if (next[value] == Values.WALL) return true;

            const chainOfUpdates = this.getChainOfUpdates(next, direction);
            if (chainOfUpdates == null) return true;

            this.performUpdatesFromChain(chainOfUpdates);
        }

        return true;
    }

    private getChainOfUpdates(next: GridCell<string>, direction: Direction) {
        const chainOfUpdates = [
            this.grid[this.robotPosition.y][this.robotPosition.x],
            next
        ];

        while (next[value] != Values.EMPTY) {
            next = this.getNext(direction, next);

            if (next[value] == Values.WALL) {
                return null;
            }

            chainOfUpdates.push(next);
        }

        chainOfUpdates.reverse();

        return chainOfUpdates;
    }

    private fixDuplicateBoxMovement(
        root: TreeNode<GridCell<string>>,
        direction: Direction
    ) {
        const seen = new ObjectSet<GridCell<string>>([], (x) => x.key);

        const traverse = (node: TreeNode<GridCell<string>>) => {
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                if (seen.has(child.node)) {
                    node.children[i] = new TreeNode<GridCell<string>>(
                        this.getNext(direction, node.node)
                    );
                } else {
                    seen.add(child.node);
                    traverse(child);
                }
            }
        };

        traverse(root);
    }

    private getTreeOfUpdates(
        node: GridCell<string>,
        direction: Direction.Up | Direction.Down
    ): TreeNode<GridCell<string>> | null {
        let next = this.getNext(direction, node);

        if (next[value] == Values.WALL) return null;
        if (next[value] == Values.EMPTY)
            return new TreeNode<GridCell<string>>(node, [
                new TreeNode<GridCell<string>>(next, [])
            ]);

        if (node[value] == next[value]) {
            const singleNode = this.getTreeOfUpdates(
                this.getNext(direction, node),
                direction
            );
            if (singleNode == null) return null;

            return new TreeNode<GridCell<string>>(node, [singleNode]);
        }

        let offset =
            next[value] == Values.BIG_BOX_LEFT
                ? 1
                : next[value] == Values.BIG_BOX_RIGHT
                ? -1
                : 0;

        const next1 = this.getTreeOfUpdates(
            this.getNext(direction, node),
            direction
        );
        const next2 = this.getTreeOfUpdates(
            this.getNext(direction, this.grid[node.y][node.x + offset]),
            direction
        );

        if (next1 == null || next2 == null) return null;

        return new TreeNode<GridCell<string>>(node, [next1, next2]);
    }

    private performUpdatesFromChain(chainOfUpdates: GridCell<string>[]) {
        for (let i = 0; i < chainOfUpdates.length; i++) {
            const element = chainOfUpdates[i];
            const prevElementValue =
                chainOfUpdates[i + 1]?.[value] ?? Values.EMPTY;
            element[value] = prevElementValue;
            if (element[value] == '@') {
                this.robotPosition.x = element.x;
                this.robotPosition.y = element.y;
            }
        }
    }

    private performUpdatesFromTree(
        tree: TreeNode<GridCell<string>>,
        direction: Direction.Up | Direction.Down
    ) {
        if (tree.children.length == 0) return;

        tree.children.forEach((c) => {
            this.performUpdatesFromTree(c, direction);
        });

        const next = this.getNext(direction, tree.node);
        next[value] = tree.node[value];
        if (next[value] == Values.ROBOT) {
            this.robotPosition.x = next.x;
            this.robotPosition.y = next.y;
        }
        tree.node[value] = Values.EMPTY;
    }

    private getNext(direction: Direction, origin?: GridCell<string>) {
        origin =
            origin ?? this.grid[this.robotPosition.y][this.robotPosition.x];

        switch (direction) {
            case Direction.Up:
                return origin[up]!;
            case Direction.Down:
                return origin[down]!;
            case Direction.Left:
                return origin[left]!;
            case Direction.Right:
                return origin[right]!;
        }
    }
}

function getData(pt2: boolean) {
    return parse('tasks\\data\\15.txt', (input) => {
        let [gridString, directionsString] = input.trim().split('\r\n\r\n');

        if (pt2) {
            gridString = gridString.replaceAll(
                Values.WALL,
                Values.WALL + Values.WALL
            );
            gridString = gridString.replaceAll(
                Values.SMALL_BOX,
                Values.BIG_BOX_LEFT + Values.BIG_BOX_RIGHT
            );
            gridString = gridString.replaceAll(
                Values.EMPTY,
                Values.EMPTY + Values.EMPTY
            );
            gridString = gridString.replaceAll(
                Values.ROBOT,
                Values.ROBOT + Values.EMPTY
            );
        }

        const grid = gridString.split('\r\n').map((r) =>
            r
                .trim()
                .split('')
                .map((c) => new GridCell(c))
        );
        const maxCoordY = grid.length - 1;
        const maxCoordX = grid[0].length - 1;

        const directions = directionsString
            .trim()
            .split('')
            .map((d) => {
                switch (d) {
                    case '^':
                        return Direction.Up;
                    case 'v':
                        return Direction.Down;
                    case '>':
                        return Direction.Right;
                    case '<':
                        return Direction.Left;
                    default:
                        return undefined;
                }
            })
            .filter((x) => x != undefined);

        let robotPosition: Point;

        for (let y = 0; y <= maxCoordY; y++) {
            for (let x = 0; x <= maxCoordX; x++) {
                const cell = grid[y][x];

                cell.setCoords(x, y);

                if (cell[value] == Values.ROBOT)
                    robotPosition = new Point(x, y);

                if (x > 0 && grid[y][x - 1][value]) {
                    cell[left] = grid[y][x - 1];
                }
                if (x < maxCoordX && grid[y][x + 1][value]) {
                    cell[right] = grid[y][x + 1];
                }
                if (y > 0 && grid[y - 1][x][value]) {
                    cell[up] = grid[y - 1][x];
                }
                if (y < maxCoordY && grid[y + 1][x][value]) {
                    cell[down] = grid[y + 1][x];
                }
            }
        }

        return new Warehouse(grid, directions, robotPosition!, pt2);
    });
}

export async function pt1() {
    const data = await getData(false);
    while (data.move());

    return data.grid
        .flat()
        .filter((x) => x[value] == Values.SMALL_BOX)
        .map((x) => x.y * 100 + x.x)
        .reduce((x, y) => x + y);
}

export async function pt2() {
    const data = await getData(true);
    while (data.move());
    return data.grid
        .flat()
        .filter((x) => x[value] == Values.BIG_BOX_LEFT)
        .map((x) => x.y * 100 + x.x)
        .reduce((x, y) => x + y);
}
