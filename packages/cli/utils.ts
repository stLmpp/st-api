import { SpawnOptions, spawn } from 'node:child_process';

export function spawnAsync(
  command: string,
  commandArguments: string[],
  options?: SpawnOptions,
): Promise<void> {
  return new Promise((resolve) => {
    const program = spawn(command, commandArguments, options ?? {});
    /**
     * @type { Error | undefined }
     */
    program.on('exit', () => {
      resolve();
    });
  });
}
