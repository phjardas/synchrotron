import { Logger } from './logger';

export * from './logger';
export * from './plugin-api';

export interface Options {
  verbose: boolean;
  quiet: boolean;
  /** If set, the tasks are not actually executed but only log their intent. */
  dryRun: boolean;
  extensions: { [key: string]: string };
}

export interface EngineOptions extends Options {
  logger: Logger;
}
