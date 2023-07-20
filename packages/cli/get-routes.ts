import { basename, extname, join } from 'node:path';

import fastGlob from 'fast-glob';
import { z } from 'zod';

import { METHOD_SCHEMA } from '../../libs/common/index.js';

import { ROUTES_GLOB } from './constants.js';

export interface Route {
  path: string;
  endPoint: string;
  metaDtsPath: string;
  filename: string;
  dtsPath: string;
  importPath: string;
  method: z.infer<typeof METHOD_SCHEMA>;
}

export async function getRoutes(): Promise<Route[]> {
  const routes = await fastGlob(ROUTES_GLOB);
  return routes
    .map((path): Route => {
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
      const importPath = `./${path}`;
      return {
        path,
        filename,
        method,
        endPoint,
        dtsPath,
        metaDtsPath,
        importPath,
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
