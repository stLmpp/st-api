export function objectKeys<T extends Record<any, any>>(
  value: T,
): Array<keyof T> {
  return Object.keys(value);
}

export function arrayUniqWith<T>(
  array: readonly T[],
  comparator: (valueA: T, valueB: T) => unknown,
): T[] {
  const set = new Set<number>();
  const length = array.length;
  for (let index = 0; index < length; index++) {
    for (let subIndex = index + 1; subIndex < length; subIndex++) {
      const valueA = array[index];
      const valueB = array[subIndex];
      if (valueA === undefined || valueB === undefined) {
        continue;
      }
      if (comparator(valueA, valueB)) {
        set.add(index);
        break;
      }
    }
  }
  return array.filter((_, index) => !set.has(index));
}

export * from './schemas.js';
