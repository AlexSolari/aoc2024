import type { ObjectSet } from './objectSet';

export function dfs<T>(
    cell: T,
    area: T[],
    visited: ObjectSet<T>,
    getNext: (pivot: T) => T[]
) {
    if (visited.has(cell)) return;

    visited.add(cell);
    area.push(cell);

    for (const neighbor of getNext(cell)) {
        dfs(neighbor, area, visited, getNext);
    }
}
