import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { FileSystemSong } from '../../filesystem-song';
import { Library, LibraryAdapter, Playlist, Song } from '../../plugin-api';

const readFile = promisify(fs.readFile);

export interface PlaylistOptions {
  readonly playlistFiles: string[];
}

export class PlaylistLibraryAdapter implements LibraryAdapter {
  constructor(private options: PlaylistOptions) {}

  async loadLibrary(): Promise<Library> {
    const playlists = await this.loadPlaylists();
    const songs = this.getSongs(playlists);
    return { songs, playlists };
  }

  private getSongs(playlists: Playlist[]): Song[] {
    const songs = playlists.map(p => p.songs).reduce((a, b) => a.concat(b), []);
    return Array.from(new Set(songs)).sort();
  }

  private loadPlaylists(): Promise<Playlist[]> {
    return Promise.all(this.options.playlistFiles.map(playlistFile => this.parsePlaylist(playlistFile)));
  }

  private async parsePlaylist(file: string): Promise<Playlist> {
    const dir = path.dirname(file);
    const data = await readFile(file, 'utf-8');
    const songs = data
      .split(/\r?\n/)
      .filter(s => !!s.trim())
      .map(s => new FileSystemSong(path.resolve(dir, s), s));

    return {
      name: path.basename(file).replace(/\.m3u8?$/, ''),
      songs,
    };
  }
}
