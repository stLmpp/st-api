import { InjectionToken } from '@stlmpp/di';
import { objectKeys } from '@libs/common';

/**
 *
 * @type {InjectionToken<string>}
 */
export const APP_NAME = new InjectionToken('APP_NAME');

console.log(objectKeys({}));
