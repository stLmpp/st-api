#!/usr/bin/env node

import { program } from 'commander';
import { z } from 'zod';

import { build } from '../build.js';
import { watch } from '../watch.js';

const BUILD_ARGS = z.object({
  dev: z.boolean().default(false),
});

const WATCH_ARGS = BUILD_ARGS.extend({});

await program
  .command('build')
  .description('Build')
  .option('--dev', 'Produce build without any optimizations')
  .action(async (optionsUnparsed) => {
    const options = BUILD_ARGS.parse(optionsUnparsed);
    await build(options);
  })
  .command('watch')
  .description('Build the project in watch mode')
  .option('--dev', 'Produce build without any optimizations')
  .action(async (optionsUnparsed) => {
    const options = WATCH_ARGS.parse(optionsUnparsed);
    await watch({ ...options, initialBuild: true });
  })
  .parseAsync();
