import { Engine, Extension, OptionSpec, ParsedOptions } from '../../plugin-api';
import { FilesystemTargetAdapter, FilesystemTargetAdapterOptions } from './filesystem.target-adapter';

class FilesystemTargetAdapterExtension implements Extension {
  type = 'target-adapter';
  id = 'filesystem';
  options: OptionSpec[] = [
    {
      id: 'target-dir',
      label: 'Target directory',
      type: 'directory',
      required: true,
      description: 'The target directory to which to synchronize files to',
    },
  ];

  extend(engine: Engine, args: ParsedOptions): Engine {
    const opts: FilesystemTargetAdapterOptions = {
      targetDir: args['target-dir'],
    };

    engine.targetAdapter = new FilesystemTargetAdapter(opts);
    return engine;
  }
}

export default FilesystemTargetAdapterExtension;
