import { InjectionToken, Provider, ROOT_INJECTOR } from '@stlmpp/di';

export function apiAdapter(options: {
  name: string;
  providers?: Provider[];
}): () => void {
  return () => {
    ROOT_INJECTOR.register(options.providers ?? []);
  };
}

export const RATE_LIMITER = new InjectionToken<
  (request: Request, response: Response) => Promise<boolean>
>('RateLimiter');
