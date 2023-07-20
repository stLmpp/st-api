import { build } from './build.js';

export interface WatchOptions {
  dev?: boolean;
  initialBuild?: boolean;
}

class Watch {
  constructor(options: WatchOptions) {
    this.#options = options;
  }

  #options: WatchOptions;

  async watch(): Promise<void> {
    if (this.#options.initialBuild) {
      await build({
        dev: this.#options.dev,
        skipDtsFilesCreation: true,
      });
    }
  }
}

export function watch(options: WatchOptions) {
  return new Watch(options).watch();
}
