import { BaseEnvironment } from './base-environment.js';
import { EnvProp } from './env-prop.decorator.js';
import { Env } from './env.decorator.js';

@Env()
export class CoreEnvironment extends BaseEnvironment {
  @EnvProp({ name: 'RATE_LIMITER_MAX_CALLS' })
  rateLimiterMaxCalls = 100;
  @EnvProp({ name: 'RATE_LIMITER_PERIOD_SECONDS' })
  rateLimiterPeriodSeconds = 10 * 60;
  // @EnvProp({ TODO LOGGER
  //   name: 'LOGGER_LEVEL',
  //   parser: (value) => {
  //     const logger_level_schema = z.nativeEnum(LogLevel);
  //     const result = logger_level_schema.safeParse(value ?? LogLevel.WARN);
  //     return result.success ? result.data : LogLevel.WARN;
  //   },
  // })
  // loggerLevel = LogLevel;
}
