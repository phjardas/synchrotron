import { Logger } from './logger';
import { TaskResult } from './plugin-api';

export * from './logger';
export * from './plugin-api';

export interface Options {
  verbose: boolean;
  quiet: boolean;
  /** If set, the tasks are not actually executed but only log their intent. */
  dryRun: boolean;
  noProgress: boolean;
  extensions: { [key: string]: string };
}

export interface EngineOptions extends Options {
  logger: Logger;
}

export interface Task {
  execute(): Promise<TaskResult>;
  dryRun(): Promise<TaskResult>;
}
