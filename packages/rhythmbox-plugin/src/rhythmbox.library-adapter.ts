import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { promisify } from 'util';
import { LibraryAdapter, Playlist, Library, Song } from '@synchrotron/plugin-api';
import { FileSystemSong } from '@synchrotron/common';

export interface RhythmboxOptions {
  readonly configDir: string;
  readonly libraryDir: string;
  readonly playlists?: string[];
}

export class RhythmboxLibraryAdapter implements LibraryAdapter {
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
    const parseXml: (xml: string) => Promise<any> = xml =>
      new Promise((resolve, reject) => {
        xml2js.parseString(xml, (err, result) => (err ? reject(err) : resolve(result)));
      });

    const playlistsFile = `${this.options.configDir}/playlists.xml`;
    const xml = await promisify(fs.readFile)(playlistsFile, 'utf8');
    const data = await parseXml(xml);

    const filterPlaylist: (any) => boolean =
      !this.options.playlists || !this.options.playlists.length ? _ => true : p => this.options.playlists.indexOf(p.$.name) >= 0;

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

    return (
      data.location
        .filter(f => f && f.startsWith(prefix))
        .map(decodeURI)
        // FIXME parse artist, album etc.
        .map(f => new FileSystemSong(f.replace('file://', ''), f.replace(prefix, '')))
    );
  }
}
