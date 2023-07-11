import { join } from 'node:path';

/**
 * @param {object} options
 * @param {string} options.path
 * @param {boolean} [options.dev]
 * @param {boolean} [options.watch]
 * @returns {Promise<void>}
 */
export async function build(options) {}

/**
 * @param {string} path
 * @returns {Promise<void>}
 */
async function createDtsFiles(path) {
  const tscPath = join(process.cwd());
}
