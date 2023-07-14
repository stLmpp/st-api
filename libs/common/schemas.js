import { z } from 'zod';

export const METHOD_SCHEMA = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
