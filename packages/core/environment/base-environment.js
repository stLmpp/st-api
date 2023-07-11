import { EnvProp } from './env-prop.decorator.js';

/**
 * @abstract
 */
export class BaseEnvironment {
  @EnvProp({ name: 'NODE_ENV', default: 'development' })
  nodeEnv = 'development';

  @EnvProp({
    name: 'NODE_ENV',
    parser: (nodeEnv) => nodeEnv === 'production',
    default: false,
  })
  production = false;
}
