#!/usr/bin/env node

import { program } from 'commander';
import { build } from '../build.js';
import { z } from 'zod';

const BUILD_ARGS = z.object({
  dev: z.boolean().default(false),
  watch: z.boolean().default(false),
});

await program
  .command('build')
  .description('Build')
  .option('--dev', 'Produce build without any optimizations')
  .option('--watch', 'Watch for file changes')
  .action(async (optionsUnparsed) => {
    const options = BUILD_ARGS.parse(optionsUnparsed);
    await build({
      ...options,
      path: process.cwd(), // TODO CHECK IF THIS IS REALLY NECESSARY
    });
  })
  .parseAsync();
