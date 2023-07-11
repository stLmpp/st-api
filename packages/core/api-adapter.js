import { InjectionToken, ROOT_INJECTOR } from '@stlmpp/di';

/**
 * @param {object} options
 * @param {string} options.name
 * @param {import('@stlmpp/di').Provider[]} [options.providers]
 * @returns {() => void}
 */
export function apiAdapter(options) {
  return () => {
    ROOT_INJECTOR.register(options.providers ?? []);
  };
}

/**
 * @type {InjectionToken<(req: import('express').Request, res: import('express').Response) => Promise<boolean>>}
 */
export const RATE_LIMITER = new InjectionToken('RateLimiter');
