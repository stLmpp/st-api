import { readFile, rm, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { watch } from 'chokidar';
import fastGlob from 'fast-glob';
import { copy, outputFile } from 'fs-extra';
import { debounceTime, Subject } from 'rxjs';
import { build as tsupBuild, Options } from 'tsup';
import { PackageJson } from 'type-fest';

import { objectKeys } from '../libs/common/index.js';
import rootPackageJson from '../package.json' assert { type: 'json' };
import { spawnAsync } from '../packages/cli/utils.js';

const PACKAGES_PATH = 'packages';
const DIST_PATH = 'dist';
const PACKAGE_SCOPE = '@st-api';
const ROOT_PACKAGE_JSON_DEPENDENCIES = objectKeys(rootPackageJson.dependencies);
const PACKAGES = await readdir(PACKAGES_PATH);
const WATCH_MODE = process.argv.includes('--watch');
const DEV_MODE = process.argv.includes('--dev');

await rm('dist', { recursive: true, force: true });

async function linkCliPackage() {
  console.log('Linking CLI package...');
  const pathCli = join(process.cwd(), 'dist', 'cli');
  await spawnAsync('npm', ['unlink', '-g'], {
    cwd: pathCli,
    shell: true,
  });
  await spawnAsync('npm', ['link'], {
    cwd: pathCli,
    shell: true,
  });
  console.log('Link complete');
}

type RootPackageJsonDependencies = (typeof rootPackageJson)['dependencies'];

async function getDependenciesUsed(
  packageName: string,
): Promise<Array<keyof RootPackageJsonDependencies>> {
  const files = await fastGlob(`${PACKAGES_PATH}/${packageName}/**/*.js`);
  const usedDependencies: Array<keyof RootPackageJsonDependencies> = [];
  let allDependencies = [...ROOT_PACKAGE_JSON_DEPENDENCIES];
  // TODO improve this
  for (const file of files) {
    const fileContent = await readFile(file, 'utf8');
    for (const dependency of allDependencies) {
      if (fileContent.includes(`'${dependency}'`)) {
        usedDependencies.push(dependency);
        allDependencies = allDependencies.filter(
          (_dependency) => dependency !== _dependency,
        );
      }
    }
    if (ROOT_PACKAGE_JSON_DEPENDENCIES.length === usedDependencies.length) {
      break;
    }
  }
  return usedDependencies;
}

async function buildPackage(packageName: string): Promise<void> {
  const sourcePath = join(PACKAGES_PATH, packageName);
  const distributionPath = join(DIST_PATH, packageName);
  const promises: Promise<unknown>[] = [];
  const files = ['index.js', 'src'];
  const isCli = packageName === 'cli';
  if (isCli) {
    promises.push(copy(join(sourcePath, 'bin'), join(distributionPath, 'bin')));
    files.push('bin');
  }

  const packageJson: PackageJson = {
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
      join(distributionPath, 'package.json'),
      JSON.stringify(packageJson, undefined, 2),
    ),
  );
  const options: Options = {
    dts: true,
    bundle: true,
    outDir: distributionPath,
    format: 'esm',
    platform: 'node',
    target: 'esnext',
    sourcemap: true,
    silent: true,
    name: packageName,
    splitting: false,
    external: dependencies.map(String),
    minify: !DEV_MODE,
  };
  options.entry = { index: join(sourcePath, 'index.ts') };
  if (isCli) {
    options.entry['bin/index'] = join(sourcePath, 'bin', 'index.ts');
  }
  promises.push(tsupBuild(options));
  await Promise.all(promises);
}

async function buildPackages(): Promise<void> {
  console.log('Building packages...');
  await Promise.all(PACKAGES.map((packageName) => buildPackage(packageName)));
  console.log('Packages build finished');
}

await buildPackages();

if (WATCH_MODE) {
  await linkCliPackage();

  const watcher = watch('packages/**/*.ts', {
    ignoreInitial: true,
  });
  const events = ['add', 'change', 'unlink'] as const;
  const build$ = new Subject<void>();
  build$.pipe(debounceTime(100)).subscribe(async () => {
    await buildPackages();
    await linkCliPackage();
  });
  for (const event of events) {
    watcher.on(event, async () => {
      build$.next();
    });
  }
  console.log('Watching for changes...');
}
