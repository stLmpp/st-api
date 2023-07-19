import { Injectable } from '@stlmpp/di';
import { Class } from 'type-fest';

import { environmentMetadata } from './environment.metadata.js';

export function Environment() {
  return (target: Class<any>) => {
    Injectable({
      root: true,
      useFactory: () => {
        const instance = new target();
        const missingVariables: string[] = [];
        for (const [, metadata] of environmentMetadata.entries(target)) {
          let value =
            process.env[metadata.name] ??
            metadata.default ??
            instance[metadata.propertyKey];
          if (!metadata.required || value !== undefined) {
            if (metadata.parser) {
              value = metadata.parser(value);
            }
          } else {
            missingVariables.push(metadata.name);
          }
          instance[metadata.propertyKey] = value;
        }
        if (missingVariables.length > 0) {
          throw new Error(
            'Missing required environment variables: \n' +
              [...new Set(missingVariables)].join('\n'),
          );
        }
        return instance;
      },
    })(target);
  };
}
