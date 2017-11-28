import { Task, TaskResult, Playlist, TargetAdapter } from "../model";


export class CreatePlaylistTask implements Task {
  constructor(
    private readonly playlist: Playlist,
    private readonly targetAdapter: TargetAdapter
  ) {}

  async execute(): Promise<TaskResult> {
    const file = `${this.playlist.name}.m3u8`;
    const out = await this.targetAdapter.createWriter(file, { encoding: 'utf8' });
    const content = this.playlist.songs.map(s => s.originalPath).join('\n') + '\n';
    
    await new Promise((resolve, reject) => {
      out.on('finish', resolve);
      out.on('error', reject);
      out.write(content);
      out.end();
    });

    return {
      playlistsCreated: 1,
    };
  }

  dryRun() {
    console.log(`PLAYLIST: ${this.playlist.name}.m3u8`);
  }
}
