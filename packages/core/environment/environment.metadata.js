/**
 * @typedef {object} EnvPropertyMetadata
 * @property {string} propertyKey
 * @property {string} name
 * @property {boolean} [secret]
 * @property {boolean} [required]
 * @property {(value: unknown) => unknown} [parser]
 * @property {unknown} [default]
 */

export class EnvironmentMetadata {
  /**
   * @type {Map<any, Map<string, EnvPropertyMetadata>>}
   */
  #store = new Map();

  /**
   * @param {any} target
   * @param {string} key
   * @param {EnvPropertyMetadata} value
   * @returns {EnvironmentMetadata}
   */
  add(target, key, value) {
    const map = this.#store.get(target) ?? new Map();
    this.#store.set(target, map.set(key, value));
    return this;
  }

  /**
   * @param {any} target
   * @returns {[any, EnvPropertyMetadata][]}
   */
  entries(target) {
    const prototype = Object.getPrototypeOf(target);
    const parent_constructor = prototype.constructor;
    const map_target = this.#store.get(target) ?? new Map();
    const map_prototype = this.#store.get(prototype) ?? new Map();
    const map_parent_constructor =
      this.#store.get(parent_constructor) ?? new Map();
    return [...map_target, ...map_prototype, ...map_parent_constructor];
  }

  all() {
    /**
     * @type {EnvPropertyMetadata[]}
     */
    const metadata = [];
    for (const [, value] of this.#store) {
      metadata.push(...value.values());
    }
    return metadata;
  }
}

export const environmentMetadata = new EnvironmentMetadata();

export function getRequiredEnvironmentVariables() {
  return environmentMetadata.all().filter((value) => value.required);
}
