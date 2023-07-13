import { spawnAsync } from './utils.js';
import fastGlob from 'fast-glob';
import { ROUTES_GLOB } from './constants.js';
import { basename } from 'node:path';

/**
 * @typedef {object} BuilderOptions
 * @property {string} path
 * @property {boolean} [dev]
 * @property {boolean} [watch]
 * @returns {Promise<void>}
 */

/**
 * @param {BuilderOptions} options
 * @returns {Promise<void>}
 */
export async function build(options) {
  return new Builder(options).build();
}

class Builder {
  /**
   * @param {BuilderOptions} options
   */
  constructor(options) {
    this.#options = options;
  }

  /**
   * @type {BuilderOptions}
   */
  #options;

  async #createTscFilesSync() {
    await spawnAsync('npm', ['run', 'build-types'], {
      shell: true,
    });
  }

  async #getRoutes() {
    const routes = await fastGlob(ROUTES_GLOB);
    return routes.map((path) => {
      const filename = basename(path);
      return {
        path,
        filename,
      };
    });
  }

  async build() {
    if (!this.#options.watch && this.#options.dev) {
      await this.#createTscFilesSync();
    }
    const routes = await this.#getRoutes();
    console.log(routes);
  }
}
