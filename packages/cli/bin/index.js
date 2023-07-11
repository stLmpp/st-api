#!/usr/bin/env node

import { program } from '@caporal/core';

program
  .command('build', 'Build')
  .option('--check', 'Produce build without any optimizations')
  .action(({ args }) => {});

program.run();
