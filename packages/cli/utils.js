import { spawn } from 'node:child_process';

/**
 *
 * @param {string} command
 * @param {string[]} commandArguments
 * @param {import('node:child_process').SpawnOptions} options
 * @returns {Promise<void>}
 */
export function spawnAsync(command, commandArguments, options) {
  return new Promise((resolve) => {
    const program = spawn(command, commandArguments, options);
    /**
     * @type { Error | undefined }
     */
    program.on('exit', () => {
      resolve();
    });
  });
}
