export class ObjectSet<T> {
    innerMap: Map<string, T> = new Map<string, T>();
    keyGen: (obj: T) => string;

    constructor(arr?: T[], keyGen?: (obj: T) => string) {
        this.keyGen =
            keyGen != undefined ? keyGen : (obj: T) => JSON.stringify(obj);

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
        this.innerMap.set(this.keyGen(item), item);
    }

    delete(item: T) {
        return this.innerMap.delete(this.keyGen(item));
    }

    has(item: T) {
        return this.innerMap.has(this.keyGen(item));
    }

    get length() {
        return [...this.innerMap.values()].length;
    }
}
