export class ObjectSet<T> {
    innerMap: Map<string, T> = new Map<string, T>();

    constructor(arr?: T[]) {
        if (arr) {
            for (const el of arr) {
                this.add(el);
            }
        }
    }

    [Symbol.iterator]() {
        return this.innerMap.values();
    }

    add(item: T) {
        this.innerMap.set(JSON.stringify(item), item);
    }

    delete(item: T) {
        return this.innerMap.delete(JSON.stringify(item));
    }

    has(item: T) {
        return this.innerMap.has(JSON.stringify(item));
    }

    get length() {
        return [...this.innerMap.values()].length;
    }
}
