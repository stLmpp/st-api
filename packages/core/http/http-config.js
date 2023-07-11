import { z } from 'zod';

export const HTTP_CONFIG_SCHEMA = z.object({
  request: z
    .object({
      params: z.any().optional(),
      query: z.any().optional(),
      headers: z.any().optional(),
      body: z.any().optional(),
    })
    .optional(),
  response: z.any(),
});

/**
 * @template {import('zod').ZodType} Params
 * @template {import('zod').ZodType} Query
 * @template {import('zod').ZodType} Headers
 * @template {import('zod').ZodType} Body
 * @template {import('zod').ZodType} Response
 * @param {import('zod').infer<typeof HTTP_CONFIG_SCHEMA> & {
 *   request?: {
 *     params?: Params;
 *     query?: Query;
 *     headers?: Headers;
 *     body?: Body;
 *   };
 *   response: Response;
 * }} options
 */
export function httpConfig(options) {
  return options;
}
