export class TreeNode<T> {
    node: T;
    children: TreeNode<T>[];

    constructor(value: T, path?: TreeNode<T>[]) {
        this.node = value;
        this.children = path ??= [];
    }

    public isFlat(): boolean {
        if (this.children.length == 0) return true;

        if (this.children.length > 1) return false;

        return this.children.map((c) => c.isFlat()).reduce((x, y) => x && y);
    }

    public flat(): T[] {
        return [this.node, ...this.children.flatMap((c) => c.flat())];
    }
}
