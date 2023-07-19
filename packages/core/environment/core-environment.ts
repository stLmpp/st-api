import { BaseEnvironment } from './base-environment.js';
import { EnvironmentProperty } from './environment-property.decorator.js';
import { Environment } from './environment.decorator.js';

@Environment()
export class CoreEnvironment extends BaseEnvironment {
  @EnvironmentProperty({ name: 'RATE_LIMITER_MAX_CALLS' })
  rateLimiterMaxCalls = 100;
  @EnvironmentProperty({ name: 'RATE_LIMITER_PERIOD_SECONDS' })
  rateLimiterPeriodSeconds = 10 * 60;
  // @EnvironmentProperty({ TODO LOGGER
  //   name: 'LOGGER_LEVEL',
  //   parser: (value) => {
  //     const logger_level_schema = z.nativeEnum(LogLevel);
  //     const result = logger_level_schema.safeParse(value ?? LogLevel.WARN);
  //     return result.success ? result.data : LogLevel.WARN;
  //   },
  // })
  // loggerLevel = LogLevel;
}
