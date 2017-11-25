import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { promisify } from 'util';
import { Argv, Arguments } from 'yargs';

import { Engine, LibraryAdapter, Playlist, Library, Song } from '../../../src/model';
import { Plugin, Extension } from '../../../src/plugin';


class RhythmboxLibraryAdapterExtension implements Extension {
  id = 'rhythmbox';
  type = 'library-adapter';

  addCommandLineOptions(yargs: Arguments): Arguments {
    return yargs
      .option('rhythmbox-config-dir', { demandOption: true, describe: 'path to the configuration directory of Rhythmbox, usually at `~/.local/share/rhythmbox`' })
      .option('rhythmbox-library-dir', { demandOption: true, describe: 'path to your music library, eg. `~/Music' })
      .option('rhythmbox-playlists', { array: true, describe: 'names of playlists to synchronize, omit to synchronize all playlists' });
    ;
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


interface RhythmboxOptions {
  readonly configDir: string;
  readonly libraryDir: string;
  readonly playlists?: string[];
}


class RhythmboxLibraryAdapter implements LibraryAdapter {
  constructor(private options: RhythmboxOptions) {}

  async loadLibrary(): Promise<Library> {
    const playlists = await this.loadPlaylists();
    const songs = this.getSongs(playlists);
    return { songs, playlists };
  }

  private getSongs(playlists: Playlist[]): Song[] {
    const songs = playlists.map(p => p.songs).reduce((a, b) => a.concat(b), []);
    return Array.from(new Set(songs)).sort();
  }

  private async loadPlaylists(): Promise<Playlist[]> {
    const parseXml: (xml: string) => Promise<any> = xml => new Promise((resolve, reject) => {
      xml2js.parseString(xml, (err, result) => err ? reject(err) : resolve(result));
    });

    const playlistsFile = `${this.options.configDir}/playlists.xml`;
    const xml = await promisify(fs.readFile)(playlistsFile, 'utf8');
    const data = await parseXml(xml);

    const filterPlaylist: (any) => boolean =
      !this.options.playlists || !this.options.playlists.length
      ? _ => true
      : p => this.options.playlists.indexOf(p.$.name) >= 0;

    return data['rhythmdb-playlists'].playlist
      .filter(el => el.$.type === 'static')
      .filter(filterPlaylist)
      .map(el => this.parsePlaylist(el));
  }

  private parsePlaylist(data: any): Playlist {
    return {
      name: data.$.name,
      songs: this.getPlaylistSongs(data),
    };
  }

  private getPlaylistSongs(data: any): Song[] {
    const prefix = `file://${this.options.libraryDir}/`;

    return data.location
      .filter(f => f && f.startsWith(prefix))
      .map(decodeURI)
      .map(f => ({
        absoluteFilename: f.replace('file://', ''),
        relativeFilename: f.replace(prefix, '')
      }));
  }
}


const plugin: Plugin = {
  id: 'rhythmbox',
  version: '0.1.0',
  name: 'Rhythmbox',
  description: 'Parses playlist from Rhythmbox',
  author: 'Philipp Jardas <philipp@jardas.de>',
  extensions: [
    new RhythmboxLibraryAdapterExtension(),
  ],
}

export default plugin;
