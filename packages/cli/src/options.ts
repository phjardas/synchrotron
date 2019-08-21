import * as yargs from 'yargs';
import { Options } from 'synchrotron-core';

export function parseMainOptions(args: string[]): Options {
  const argv = createOptionsParser(args).argv;
  return {
    extensions: argv,
    dryRun: argv.dryRun || false,
    skipDelete: argv.skipDelete || false,
  };
}

export function createOptionsParser(args: string[]): yargs.Arguments<any> {
  return yargs(args)
    .option('dry-run', { boolean: true })
    .option('skip-delete', { boolean: true })
    .option('library-adapter', { demandOption: true })
    .option('target-adapter', { default: 'filesystem' })
    .config();
}
