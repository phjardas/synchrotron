import { Argv, Arguments } from 'yargs';
import { Engine, Plugin, Extension } from '@synchrotron/plugin-api';

import { RhythmboxLibraryAdapter, RhythmboxOptions } from './rhythmbox.library-adapter';

class RhythmboxLibraryAdapterExtension implements Extension {
  id = 'rhythmbox';
  type = 'library-adapter';

  addCommandLineOptions(yargs: Arguments): Arguments {
    return yargs
      .option('rhythmbox-config-dir', {
        demandOption: true,
        describe: 'path to the configuration directory of Rhythmbox, usually at `~/.local/share/rhythmbox`',
      })
      .option('rhythmbox-library-dir', { demandOption: true, describe: 'path to your music library, eg. `~/Music' })
      .option('rhythmbox-playlists', { array: true, describe: 'names of playlists to synchronize, omit to synchronize all playlists' });
  }

  extend(engine: Engine, args: Argv): Engine {
    const opts: RhythmboxOptions = {
      configDir: args['rhythmbox-config-dir'],
      libraryDir: args['rhythmbox-library-dir'],
      playlists: args['rhythmbox-playlists'],
    };

    engine.libraryAdapter = new RhythmboxLibraryAdapter(opts);
    return engine;
  }
}

export const plugin: Plugin = {
  id: 'rhythmbox',
  version: '0.1.0',
  name: 'Rhythmbox',
  description: 'Parses playlist from Rhythmbox',
  author: 'Philipp Jardas <philipp@jardas.de>',
  extensions: [new RhythmboxLibraryAdapterExtension()],
};
