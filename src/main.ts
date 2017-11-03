import { parseOptions } from './options';
import { Synchrotron } from './engine';
import { discoverAndApplyPlugins } from './plugins/index';


async function main() {
  try {
    const options = parseOptions(process.argv);
    const engine = new Synchrotron(options)
    await discoverAndApplyPlugins(engine);
    const results = await engine.execute();
    console.log(results);
  } catch (err) {
    console.error('ERROR:', err);
  }
}

main();
