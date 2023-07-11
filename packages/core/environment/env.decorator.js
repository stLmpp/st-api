import { Injectable } from '@stlmpp/di';

import { environmentMetadata } from './environment.metadata.js';

/**
 * @returns {(target: any) => void}
 */
export function Env() {
  return (target) => {
    Injectable({
      root: true,
      useFactory: () => {
        const instance = new target();
        /**
         * @type {string[]}
         */
        const missingVariables = [];
        for (const [, metadata] of environmentMetadata.entries(target)) {
          let value =
            process.env[metadata.name] ??
            metadata.default ??
            instance[metadata.propertyKey];
          if (!metadata.required || typeof value !== 'undefined') {
            if (metadata.parser) {
              value = metadata.parser(value);
            }
          } else {
            missingVariables.push(metadata.name);
          }
          instance[metadata.propertyKey] = value;
        }
        if (missingVariables.length) {
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
