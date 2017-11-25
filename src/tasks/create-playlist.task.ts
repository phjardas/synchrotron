import * as path from 'path';

import { mkdirs, writeFile } from './helpers';
import { Task, TaskResult, Playlist } from "../model";


export class CreatePlaylistTask implements Task {
  private readonly filename: string;

  constructor(private readonly playlist: Playlist, targetDir: string) {
    this.filename = `${targetDir}/${this.playlist.name}.m3u8`;
  }

  async execute(): Promise<TaskResult> {
    const p = path.parse(this.filename);
    await mkdirs(p.dir);

    const content = this.playlist.songs.map(s => s.relativeFilename).join('\n') + '\n';
    await writeFile(this.filename, content, 'utf8');

    return {
      playlistsCreated: 1,
    };
  }

  dryRun() {
    console.log('PLAYLIST: %s', this.filename);
  }
}
