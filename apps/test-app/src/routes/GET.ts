import { Injectable } from '@stlmpp/di';
import { httpConfig } from '@st-api/core';
import { z } from 'zod';

@Injectable()
export default class Get {
  static config = httpConfig({
    request: {
      params: z.object({
        id: z.string(),
      }),
      query: z.object({
        term: z.string(),
      }),
      headers: z.object({
        'x-api': z.string(),
      }),
    },
    response: z.object({
      id: z.bigint(),
    }),
  });
  static exceptions = {};
}
