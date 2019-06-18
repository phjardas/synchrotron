import { createLogger, Engine, PluginManager, Synchrotron } from 'synchrotron-core';
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

  const opts = extensions.reduce((a, e) => e.addCommandLineOptions(a), createOptionsParser(args)).argv;

  opts.logger = createLogger(opts);

  return extensions.reduce((engine, ex) => ex.extend(engine, opts), new Synchrotron(opts));
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
