import { Engine, Extension, OptionSpec, ParsedOptions, Plugin } from '../../plugin-api';
import { PlaylistLibraryAdapter, PlaylistOptions } from './playlist.library-adapter';

class PlaylistLibraryAdapterExtension implements Extension {
  id = 'playlist';
  type = 'library-adapter';
  options: OptionSpec[] = [
    {
      id: 'playlist-files',
      required: true,
      type: 'files',
      description: 'comma-separated path to M3U playlists',
    },
  ];

  extend(engine: Engine, args: ParsedOptions): Engine {
    const opts: PlaylistOptions = {
      playlistFiles: args['playlist-files'].split(/\s*,\s*/),
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
