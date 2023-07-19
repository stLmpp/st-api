import { EnvironmentProperty } from './environment-property.decorator.js';

/**
 * @abstract
 */
export class BaseEnvironment {
  @EnvironmentProperty({ name: 'NODE_ENV', default: 'development' })
  nodeEnv = 'development';

  @EnvironmentProperty({
    name: 'NODE_ENV',
    parser: (nodeEnvironment) => nodeEnvironment === 'production',
    default: false,
  })
  production = false;
}
