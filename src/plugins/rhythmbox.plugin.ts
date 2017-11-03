import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { promisify } from 'util';

import { Plugin, Engine, LibraryAdapter, Options, Playlist } from '../model';

export const plugin: Plugin = {
  id: 'rhythmbox',
  name: 'Rhythmbox',
  description: 'Parses playlist from Rhythmbox',

  applyTo(engine: Engine) {
    engine.registerLibraryAdapter(new RhythmboxLibraryAdapter());
  }
};

class RhythmboxLibraryAdapter implements LibraryAdapter {
  readonly id = 'rhythmbox';
  readonly name = 'Rhythmbox';
  readonly description = 'Parses playlist from Rhythmbox';

  async loadPlaylists(options: Options): Promise<Playlist[]> {
    const parseXml: (xml: string) => Promise<any> = xml => new Promise((resolve, reject) => {
      xml2js.parseString(xml, (err, result) => err ? reject(err) : resolve(result));
    });

    const playlistsFile = `${options.rhythmboxConfigDir}/playlists.xml`;

    const xml = await promisify(fs.readFile)(playlistsFile, 'utf8');
    const data = await parseXml(xml);

    const prefix = `file://${options.libraryDir}/`;

    return data['rhythmdb-playlists'].playlist
      .filter(el => el.$.type === 'static')
      .map(el => {
        return {
          name: el.$.name,
          files: el.location.filter(f => f && f.startsWith(prefix))
            .map(f => f.replace(prefix, ''))
            .map(decodeURI),
        };
      });
  }
}
