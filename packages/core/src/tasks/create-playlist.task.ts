import { Task, TaskResult, Playlist, TargetAdapter } from '../model';

export class CreatePlaylistTask implements Task {
  public readonly filename: string;

  constructor(private readonly playlist: Playlist, private readonly targetAdapter: TargetAdapter) {
    this.filename = `${this.playlist.name}.m3u8`;
  }

  async execute(): Promise<TaskResult> {
    const out = await this.targetAdapter.createWriter(this.filename, { encoding: 'utf8' });
    const content = this.playlist.songs.map(s => this.targetAdapter.getPlaylistPath(s.originalPath)).join('\n') + '\n';

    await new Promise((resolve, reject) => {
      out.on('finish', resolve);
      out.on('error', reject);
      out.write(content);
      out.end();
    });

    return { playlistsCreated: 1 };
  }

  async dryRun(): Promise<TaskResult> {
    console.log(`PLAYLIST: ${this.playlist.name}.m3u8`);
    return { playlistsCreated: 1 };
  }
}
