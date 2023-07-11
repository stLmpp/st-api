/**
 * @template {Record<any, any>} T
 * @param {T} value
 * @returns {Array<keyof T>}
 */
export function objectKeys(value) {
  return Object.keys(value);
}

/**
 *
 * @template T
 * @param {readonly T[]} array
 * @param {(valueA: T, valueB: T) => unknown} comparator
 * @returns {T[]}
 */
export function arrayUniqWith(array, comparator) {
  /**
   * @type {Set<number>}
   */
  const set = new Set();
  const length = array.length;
  for (let index = 0; index < length; index++) {
    for (let subIndex = index + 1; subIndex < length; subIndex++) {
      const valueA = array[index];
      const valueB = array[subIndex];
      if (typeof valueA === 'undefined' || typeof valueB === 'undefined') {
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
