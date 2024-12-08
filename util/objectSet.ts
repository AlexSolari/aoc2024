export class ObjectSet<T> {
    innerMap: Map<string, T> = new Map<string, T>();

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
