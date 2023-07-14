import { spawnAsync } from './utils.js';
import fastGlob from 'fast-glob';
import { ROUTES_GLOB } from './constants.js';
import { basename, extname, join } from 'node:path';
import { METHOD_SCHEMA } from '@libs/common';
import { writeFile } from 'node:fs/promises';
import { pathExists } from 'fs-extra/esm';

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

  async createTscFilesSync() {
    await spawnAsync('npm', ['run', 'build-types'], {
      shell: true,
    }).catch();
  }

  async getRoutes() {
    const routes = await fastGlob(ROUTES_GLOB);
    return routes
      .map((path) => {
        const filename = basename(path);
        const extension = extname(path);
        const method = METHOD_SCHEMA.parse(
          filename.replace(new RegExp(`\\${extension}$`), ''),
        );
        const parts = path.replace(/^src\/routes/, '').split('/');
        parts.pop();
        const endPoint =
          parts
            .map((part) => part.replace(/^\[/, ':').replace(/]$/, ''))
            .join('/') + '/';
        const dtsPath = join('.st-api', 'types', path).replace(
          new RegExp(`\\${extension}$`),
          '.d.ts',
        );
        const metaDtsPath = dtsPath.replace(
          new RegExp(`${method}.d.ts$`),
          `$${method}.d.ts`,
        );
        return {
          path,
          filename,
          method,
          endPoint,
          dtsPath,
          metaDtsPath,
        };
      })
      .sort(({ endPoint: endPointA }, { endPoint: endPointB }) => {
        const endPointASplit = endPointB.split('/');
        const endPointBSplit = endPointA.split('/');
        const diff = endPointASplit.length - endPointBSplit.length;
        if (diff) {
          // If there's multiple segments in the
          // end-point, it must come first
          return diff;
        }
        // Just order the rest in DESC order, to put the dynamic
        // path params last
        return endPointB.localeCompare(endPointA);
      });
  }

  /**
   *
   * @param {Awaited<ReturnType<Builder['getRoutes']>>} routes
   * @returns {Promise<void>}
   */
  async createMetaDtsFiles(routes) {
    await Promise.all(
      routes.map(async (route) => {
        if (await pathExists(route.metaDtsPath)) {
          return;
        }
        console.log(route);
        await writeFile(
          route.metaDtsPath,
          `import http from './${route.method}.js';
import { 
  HttpHandler as CoreHandler,
  HttpRequest as CoreRequest,
  HttpResponse as CoreResponse,
} from '@st-api/core';

export type HttpHandler = CoreHandler<typeof http.config>;
export type HttpRequest = CoreRequest<HttpHandler>;
export type HttpResponse = CoreResponse<HttpHandler>;`,
        );
        // TODO define types on core module
      }),
    );
  }

  async build() {
    if (!this.#options.watch && this.#options.dev) {
      console.log('Creating TSC files');
      await this.createTscFilesSync();
    }
    console.log('Getting routes');
    const routes = await this.getRoutes();
    if (!this.#options.watch && this.#options.dev) {
      console.log('Creating meta DTS files');
      await this.createMetaDtsFiles(routes);
    }
  }
}
