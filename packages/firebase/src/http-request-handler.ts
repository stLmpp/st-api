import { HTTP_REQUEST_HANDLER } from '@st-api/core';
import { FactoryProvider } from '@stlmpp/di';

export const FIREBASE_HTTP_REQUEST_HANDLER_PROVIDER = new FactoryProvider(
  HTTP_REQUEST_HANDLER,
  (request, response) => {
    // TODO
  },
);
