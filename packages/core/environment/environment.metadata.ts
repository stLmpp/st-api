interface EnvironmentPropertyMetadata {
  propertyKey: string;
  name: string;
  secret?: boolean;
  required?: boolean;
  parser?: (value: unknown) => unknown;
  default?: unknown;
}

export class EnvironmentMetadata {
  #store = new Map<any, Map<string, EnvironmentPropertyMetadata>>();

  add(
    target: any,
    key: string,
    value: EnvironmentPropertyMetadata,
  ): EnvironmentMetadata {
    const map = this.#store.get(target) ?? new Map();
    this.#store.set(target, map.set(key, value));
    return this;
  }

  entries(target: any): [any, EnvironmentPropertyMetadata][] {
    const prototype = Object.getPrototypeOf(target);
    const parent_constructor = prototype.constructor;
    const map_target = this.#store.get(target) ?? new Map();
    const map_prototype = this.#store.get(prototype) ?? new Map();
    const map_parent_constructor =
      this.#store.get(parent_constructor) ?? new Map();
    return [...map_target, ...map_prototype, ...map_parent_constructor];
  }

  all() {
    const metadata: EnvironmentPropertyMetadata[] = [];
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
