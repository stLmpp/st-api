import { readdir } from 'node:fs/promises';
import { readFile, rm } from 'fs/promises';
import { copy, outputFile } from 'fs-extra';
import { join } from 'node:path';
import rootPackageJson from '../package.json' assert { type: 'json' };
import { build as tsupBuild } from 'tsup';
import fastGlob from 'fast-glob';
import { objectKeys } from '../libs/common/index.js';

await rm('dist', { recursive: true, force: true });

const PACKAGES_PATH = 'packages';
const DIST_PATH = 'dist';
const PACKAGE_SCOPE = '@st-api';
const ROOT_PACKAGE_JSON_DEPENDENCIES = objectKeys(rootPackageJson.dependencies);
const PACKAGES = await readdir(PACKAGES_PATH);

/**
 *
 * @param {string} packageName
 * @returns {Promise<Array<keyof typeof rootPackageJson['dependencies']>>}
 */
async function getDependenciesUsed(packageName) {
  const files = await fastGlob(`${PACKAGES_PATH}/${packageName}/**/*.js`);
  /**
   * @type {Array<keyof typeof rootPackageJson['dependencies']>}
   */
  const usedDependencies = [];
  // TODO improve this
  for (const file of files) {
    const fileContent = await readFile(file, 'utf-8');
    for (const dependency of ROOT_PACKAGE_JSON_DEPENDENCIES) {
      if (fileContent.includes(`'${dependency}'`)) {
        usedDependencies.push(dependency);
      }
    }
    if (ROOT_PACKAGE_JSON_DEPENDENCIES.length === usedDependencies.length) {
      break;
    }
  }
  return usedDependencies;
}

/**
 * @param {string} packageName
 * @returns {Promise<void>}
 */
async function buildPackage(packageName) {
  const srcPath = join(PACKAGES_PATH, packageName);
  const distPath = join(DIST_PATH, packageName);
  const promises = [];
  const files = ['index.js', 'src'];
  const isCli = packageName === 'cli';
  if (isCli) {
    promises.push(copy(join(srcPath, 'bin'), join(distPath, 'bin')));
    files.push('bin');
  }
  /**
   * @type {import('type-fest').PackageJson}
   */
  const packageJson = {
    name: `${PACKAGE_SCOPE}/${packageName}`,
    author: rootPackageJson.author,
    license: rootPackageJson.license,
    version: rootPackageJson.version,
    main: 'index.js',
    module: 'index.js',
    exports: {
      '.': {
        import: './index.js',
        types: './index.d.ts',
      },
    },
    type: 'module',
    types: 'index.d.ts',
    files,
  };
  if (isCli) {
    packageJson.bin = {
      stapi: 'bin/index.js',
    };
  }
  const dependencies = await getDependenciesUsed(packageName);
  packageJson.dependencies = {};
  for (const dependency of dependencies) {
    packageJson.dependencies[dependency] =
      rootPackageJson.dependencies[dependency];
  }
  promises.push(
    outputFile(
      join(distPath, 'package.json'),
      JSON.stringify(packageJson, null, 2),
    ),
  );
  /**
   * @type {import('tsup').Options}
   */
  const options = {
    dts: true,
    bundle: true,
    outDir: distPath,
    format: 'esm',
    platform: 'node',
    target: 'esnext',
    sourcemap: true,
    silent: true,
    name: packageName,
    splitting: false,
    external: dependencies.map(String),
    minify: true,
  };
  options.entry = { index: join(srcPath, 'index.js') };
  if (isCli) {
    options.entry['bin/index'] = join(srcPath, 'bin', 'index.js');
  }
  promises.push(tsupBuild(options));
  await Promise.all(promises);
}

await Promise.all(PACKAGES.map((packageName) => buildPackage(packageName)));
