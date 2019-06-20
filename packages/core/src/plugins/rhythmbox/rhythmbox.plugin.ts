import { Engine, Extension, OptionSpec, ParsedOptions, Plugin } from '../../plugin-api';
import { RhythmboxLibraryAdapter, RhythmboxOptions } from './rhythmbox.library-adapter';

class RhythmboxLibraryAdapterExtension implements Extension {
  id = 'rhythmbox';
  type = 'library-adapter';
  options: OptionSpec[] = [
    {
      id: 'rhythmbox-config-dir',
      type: 'directory',
      required: true,
      description: 'path to the configuration directory of Rhythmbox, usually at `~/.local/share/rhythmbox`',
    },
    {
      id: 'rhythmbox-library-dir',
      type: 'directory',
      required: true,
      description: 'path to your music library, eg. `~/Music`',
    },
    {
      id: 'rhythmbox-playlists',
      type: 'string',
      required: false,
      description: 'names of playlists to synchronize, omit to synchronize all playlists',
    },
  ];

  extend(engine: Engine, args: ParsedOptions): Engine {
    const opts: RhythmboxOptions = {
      configDir: args['rhythmbox-config-dir'],
      libraryDir: args['rhythmbox-library-dir'],
      playlists: args['rhythmbox-playlists'].split(/\s*,\s*/),
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
