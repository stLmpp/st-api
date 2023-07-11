import { environmentMetadata } from './environment.metadata.js';

const DEFAULT_PARSER_MAP = new Map()
  .set(Number, (/** @type {unknown} */ value) => Number(value))
  .set(Boolean, (/** @type {unknown} */ value) =>
    typeof value === 'string' ? value === 'true' : !!value,
  );

/**
 * @param {object} options
 * @param {string} options.name
 * @param {boolean} [options.secret]
 * @param {boolean} [options.optional]
 * @param {(value: unknown) => unknown} [options.parser]
 * @param {unknown} [options.default]
 * @returns {(target: any, propertyKey: string) => void}
 */
export function EnvProp(options) {
  return (target, propertyKey) => {
    const name = options.name;
    const parser =
      options?.parser ??
      DEFAULT_PARSER_MAP.get(
        Reflect.getMetadata('design:type', target, propertyKey),
      );
    environmentMetadata.add(target.constructor, propertyKey, {
      propertyKey,
      default: options.default,
      name,
      parser,
      secret: !!options.secret,
      required: !options.optional,
    });
  };
}
