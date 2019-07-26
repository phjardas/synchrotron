export * from './plugin-api';

export interface Options {
  /** If set, the tasks are not actually executed but only log their intent. */
  dryRun: boolean;
  extensions: { [key: string]: string };
}

export interface EngineOptions extends Options {}
