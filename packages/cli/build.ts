import { writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

import { METHOD_SCHEMA } from '@libs/common';
import fastGlob from 'fast-glob';
import { pathExists } from 'fs-extra/esm';

import { ROUTES_GLOB } from './constants.js';
import { spawnAsync } from './utils.js';

async function getRoutes(): Promise<
  {
    path: string;
    endPoint: string;
    metaDtsPath: string;
    filename: string;
    dtsPath: string;
    method: string;
  }[]
> {
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

interface BuilderOptions {
  path: string;
  dev?: boolean;
  watch?: boolean;
}

export async function build(options: BuilderOptions): Promise<void> {
  return new Builder({ ...options, routes: await getRoutes() }).build();
}

class Builder {
  constructor(options: {
    routes: {
      path: string;
      endPoint: string;
      metaDtsPath: string;
      filename: string;
      dtsPath: string;
      method: string;
    }[];
    path: string;
    dev?: boolean | undefined;
    watch?: boolean | undefined;
  }) {
    this.#options = options;
  }

  #options: BuilderOptions & {
    routes: Awaited<ReturnType<typeof getRoutes>>;
  };

  async createTscFilesSync() {
    await spawnAsync('npm', ['run', 'build-types'], {
      shell: true,
    }).catch();
  }

  async createMetaDtsFiles() {
    await Promise.all(
      this.#options.routes.map(async (route) => {
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
    if (!this.#options.watch && this.#options.dev) {
      console.log('Creating meta DTS files');
      await this.createMetaDtsFiles();
    }
  }
}
