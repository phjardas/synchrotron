import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as mkdirp from 'mkdirp';

import { Task, TaskResult, Playlist } from "../model";


const writeFile = promisify(fs.writeFile);
const mkdirs = promisify(mkdirp);


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
