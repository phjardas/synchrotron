import * as fs from 'fs';
import * as yargs from 'yargs';
import { Options } from './model';


export function parseMainOptions(args: string[]): Options {
  const argv = createOptionsParser(args).argv;
  return {
    verbose: argv.verbose,
    quiet: argv.quiet,
    extensions: argv,
    dryRun: argv.dryRun || false,
  }
}

export function createOptionsParser(args: string[]): yargs.Arguments {
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

  return yargs(args)
    .version(pkg.version)
    .option('verbose', { alias: 'v', boolean: true })
    .option('quiet', { alias: 'q', boolean: true })
    .option('dry-run', { boolean: true })
    .option('library-adapter', { demandOption: true })
    .option('target-adapter', { demandOption: true })
    .config();
}
