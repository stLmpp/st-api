import { readdir } from 'node:fs/promises';
import { readFile, rm } from 'fs/promises';
import { copy, outputFile } from 'fs-extra';
import { join } from 'node:path';
import rootPackageJson from '../package.json' assert { type: 'json' };
import { build as tsupBuild } from 'tsup';
import fastGlob from 'fast-glob';

await rm('dist', { recursive: true, force: true });

const PACKAGES_PATH = 'packages';
const DIST_PATH = 'dist';
const PACKAGE_SCOPE = '@st-api';
const ROOT_PACKAGE_JSON_DEPENDENCIES = Object.keys(
  rootPackageJson.dependencies,
);

const packages = await readdir(PACKAGES_PATH);

/**
 *
 * @param {string} packageName
 * @param {string[]} dependencies
 * @returns {Promise<string[]>}
 */
async function getDependenciesUsed(packageName, dependencies) {
  const files = await fastGlob(`${PACKAGES_PATH}/${packageName}/**/*.js`);
  /**
   * @type {string[]}
   */
  const usedDependencies = [];
  for (const file of files) {
    const fileContent = await readFile(file, 'utf-8');
    for (const dependency of dependencies) {
      if (fileContent.includes(dependency)) {
        usedDependencies.push(dependency);
      }
    }
    if (dependencies.length === usedDependencies.length) {
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
  const promises = [
    copy(join(srcPath, 'index.js'), join(distPath, 'index.js')),
    copy(join(srcPath, 'src'), join(distPath, 'src')),
  ];
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
      'st-api': 'bin/index.js',
    };
  }
  const dependencies = await getDependenciesUsed(
    packageName,
    ROOT_PACKAGE_JSON_DEPENDENCIES,
  );
  packageJson.dependencies = {};
  for (const dependency of dependencies) {
    packageJson.dependencies[dependency] =
      // @ts-ignore
      rootPackageJson.dependencies[dependency];
  }
  promises.push(
    outputFile(
      join(distPath, 'package.json'),
      JSON.stringify(packageJson, null, 2),
    ),
  );
  promises.push(
    tsupBuild({
      dts: {
        only: true,
      },
      entry: { index: join(srcPath, 'index.js') },
      outDir: distPath,
      format: 'esm',
      platform: 'node',
      target: 'node18',
      silent: true,
      name: packageName,
      splitting: false,
    }),
  );
  await Promise.all(promises);
}

await Promise.all(packages.map((packageName) => buildPackage(packageName)));
