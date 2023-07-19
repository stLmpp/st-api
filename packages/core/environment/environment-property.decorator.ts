import { environmentMetadata } from './environment.metadata.js';

const DEFAULT_PARSER_MAP: ReadonlyMap<any, (value: unknown) => any> = new Map<
  any,
  (value: unknown) => any
>()
  .set(Number, Number)
  .set(Boolean, (value) =>
    typeof value === 'string' ? value === 'true' : !!value,
  );

export function EnvironmentProperty(options: {
  name: string;
  secret?: boolean;
  optional?: boolean;
  parser?: (value: unknown) => unknown;
  default?: unknown;
}): (target: any, propertyKey: string) => void {
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
