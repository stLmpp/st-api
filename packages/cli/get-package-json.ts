import { readFile } from 'node:fs/promises';

import { PackageJson, Simplify } from 'type-fest';

export async function getPackageJson(): Promise<Simplify<PackageJson>> {
  const packageJsonFile = await readFile('package.json', 'utf8');
  return JSON.parse(packageJsonFile);
}
