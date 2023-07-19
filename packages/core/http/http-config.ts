import { z, ZodType } from 'zod';

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

export function httpConfig<
  Params extends ZodType,
  Query extends ZodType,
  Headers extends ZodType,
  Body extends ZodType,
  Response extends ZodType,
>(
  options: z.infer<typeof HTTP_CONFIG_SCHEMA> & {
    request?: {
      params?: Params;
      query?: Query;
      headers?: Headers;
      body?: Body;
    };
    response: Response;
  },
) {
  return options;
}
