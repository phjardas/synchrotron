import * as fs from 'fs';
import { promisify } from 'util';

import { Task, TaskResult, Playlist, Options } from "../model";


const writeFile = promisify(fs.writeFile);


export class CreatePlaylistTask implements Task {
  constructor(private readonly playlist: Playlist) { }

  async execute(options: Options): Promise<TaskResult> {
    const filename = `${options.targetDir}/${this.playlist.name}.m3u8`;
    const content = this.playlist.files.join('\n') + '\n';
    await writeFile(filename, content, 'utf8');

    return {
      playlistsCreated: 1,
    };
  }
}
