import { readFile, writeFile } from 'node:fs/promises';

import { pathExists } from 'fs-extra/esm';
import { PackageJson, SetRequired } from 'type-fest';

import { getRoutes, Route } from './get-routes.js';
import { spawnAsync } from './utils.js';
import { getPackageJson } from './get-package-json.js';

interface BuilderOptions {
  dev?: boolean;
  skipDtsFilesCreation?: boolean;
  entryPointBuilder: (name: string) => string;
}

interface BuilderOptionsInternal extends BuilderOptions {
  routes: Route[];
  packageJson: SetRequired<PackageJson, 'name'>;
}

class Builder {
  constructor(options: BuilderOptionsInternal) {
    this.#options = options;
  }

  #options: BuilderOptionsInternal;

  private async createTscFilesSync(): Promise<void> {
    await spawnAsync('npm', ['run', 'build-types'], {
      shell: true,
    }).catch();
  }

  private async createMetaDtsFiles(): Promise<void> {
    await Promise.all(
      this.#options.routes.map(async (route) => {
        if (await pathExists(route.metaDtsPath)) {
          return;
        }
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

  private async getMainFile(): Promise<string> {
    return `
${this.#options.entryPointBuilder(this.#options.packageJson.name)}
    `;
  }

  async build() {
    if (!this.#options.skipDtsFilesCreation && this.#options.dev) {
      console.log('Creating TSC files');
      await this.createTscFilesSync();
      console.log('Creating meta DTS files');
      await this.createMetaDtsFiles();
    }
  }
}

export async function build(options: BuilderOptions): Promise<void> {
  const packageJson = await getPackageJson();
  if (!packageJson.name) {
    throw new Error('Property name on package.json is required');
  }
  return new Builder({
    ...options,
    routes: await getRoutes(),
    packageJson,
  }).build();
}
