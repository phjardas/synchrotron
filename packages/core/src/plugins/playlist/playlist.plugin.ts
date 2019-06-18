import { Arguments, Argv } from 'yargs';
import { Engine, Extension, Plugin } from '../../plugin-api';
import { PlaylistLibraryAdapter, PlaylistOptions } from './playlist.library-adapter';

class PlaylistLibraryAdapterExtension implements Extension {
  id = 'playlist';
  type = 'library-adapter';

  addCommandLineOptions(yargs: Arguments<any>): Arguments<any> {
    return yargs.option('playlist-files', {
      demandOption: true,
      array: true,
      describe: 'comma-separated path to M3U playlists',
    });
  }

  extend(engine: Engine, args: Argv): Engine {
    const opts: PlaylistOptions = {
      playlistFiles: args['playlist-files'],
    };

    engine.libraryAdapter = new PlaylistLibraryAdapter(opts);
    return engine;
  }
}

export const plugin: Plugin = {
  id: 'playlist',
  version: '0.1.0',
  name: 'Playlist',
  description: 'Parses playlists from M3U files',
  author: 'Philipp Jardas <philipp@jardas.de>',
  extensions: [new PlaylistLibraryAdapterExtension()],
};
