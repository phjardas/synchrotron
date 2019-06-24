import * as yargs from 'yargs';
import { Options } from 'synchrotron-core';

export function parseMainOptions(args: string[]): Options {
  const argv = createOptionsParser(args).argv;
  return {
    verbose: argv.verbose,
    quiet: argv.quiet,
    extensions: argv,
    dryRun: argv.dryRun || false,
    noProgress: argv.noProgress || false,
  };
}

export function createOptionsParser(args: string[]): yargs.Arguments<any> {
  return yargs(args)
    .option('verbose', { alias: 'v', boolean: true })
    .option('quiet', { alias: 'q', boolean: true })
    .option('dry-run', { boolean: true })
    .option('no-progress', { boolean: true })
    .option('library-adapter', { demandOption: true })
    .option('target-adapter', { default: 'filesystem' })
    .config();
}