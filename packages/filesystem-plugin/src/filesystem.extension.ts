import { Arguments } from 'yargs';
import { Engine, Extension } from '@synchrotron/plugin-api';

import { FilesystemTargetAdapter, FilesystemTargetAdapterOptions } from './filesystem.target-adapter';

class FilesystemTargetAdapterExtension implements Extension {
  type = 'target-adapter';
  id = 'filesystem';

  addCommandLineOptions(yargs: Arguments): Arguments {
    return yargs.option('target-dir', { demandOption: true, describe: 'The target directory to which to synchronize files to' });
  }

  extend(engine: Engine, args: any): Engine {
    const opts: FilesystemTargetAdapterOptions = {
      targetDir: args['target-dir'],
    };

    engine.targetAdapter = new FilesystemTargetAdapter(opts);
    return engine;
  }
}

export default FilesystemTargetAdapterExtension;
