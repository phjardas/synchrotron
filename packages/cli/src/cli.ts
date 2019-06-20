import { createLogger, Engine, Extension, ParsedOptions, PluginManager, Synchrotron } from 'synchrotron-core';
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
    let engine;
    try {
      engine = await createEngine(argv);
    } catch (err) {
      console.error('Error creating Synchrotron engine:', err);
      throw err;
    }

    await engine.execute();
  } catch (err) {
    process.exit(err.code || 1);
  }
}

main();
