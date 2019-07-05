import * as bytes from 'bytes';
import * as duration from 'humanize-duration';
import {
  createLogger,
  Engine,
  Extension,
  FileResult,
  ParsedOptions,
  PluginManager,
  SynchronizationResult,
  Synchrotron,
} from 'synchrotron-core';
import { Arguments } from 'yargs';
import { createOptionsParser, parseMainOptions } from './options';

async function createEngine(args: string[]): Promise<Engine> {
  const pluginManager = new PluginManager();
  const firstPassOpts = parseMainOptions(args);

  const extensions = await Promise.all(
    Synchrotron.extensionPoints
      .map(ep => {
        const extensionId = firstPassOpts.extensions[ep];
        return extensionId && pluginManager.getExtension(ep, extensionId);
      })
      .filter(e => !!e)
  );

  const opts = extensions.reduce((a, e) => addCommandLineOptions(a, e), createOptionsParser(args)).argv;

  opts.logger = createLogger(opts);

  return extensions.reduce((engine, ex) => applyCommandLineOptions(ex, engine, opts), new Synchrotron(opts));
}

function addCommandLineOptions(args: Arguments<any>, extension: Extension): Arguments<any> {
  if (extension.options) {
    extension.options.forEach(option => {
      args.option(option.id, {
        demandOption: option.required,
        decribe: option.description,
      });
    });
  }

  return args;
}

function applyCommandLineOptions(extension: Extension, engine: Engine, opts: ParsedOptions): Engine {
  return extension.extend(engine, opts);
}

export async function main(argv: string[] = process.argv) {
  try {
    const engine = await createEngine(argv);
    const results = await engine.execute();
    printResults(results);
  } catch (err) {
    process.exit(err.code || 1);
  }
}

function printResults(results: SynchronizationResult) {
  console.log('\n');
  printStatistics('Files', results.files);
  printStatistics('Playlists', results.playlists);
  console.log('Total transferred: %s', bytes(results.bytesTransferred));
  console.log('Total duration: %s', duration(results.timeMillis));
}

function printStatistics(label: string, results: FileResult[]) {
  console.log(
    '%s: %d created, %d unchanged, %d deleted, %d failed',
    label,
    results.filter(r => r.type === 'created').length,
    results.filter(r => r.type === 'unchanged').length,
    results.filter(r => r.type === 'deleted').length,
    results.filter(r => r.type === 'failed').length
  );
}

main();
