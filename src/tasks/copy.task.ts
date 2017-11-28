import { Task, TaskResult, TargetAdapter, Song } from "../model";


export class CopyTask implements Task {
  constructor(
    private readonly song: Song,
    private readonly targetAdapter: TargetAdapter
  ) {}

  async execute(): Promise<TaskResult> {
    const sourceStats = await this.song.fileStats;

    try {
      const targetStats = await this.targetAdapter.getFileStats(this.song.originalPath);

      if (sourceStats.exists && targetStats.exists) {
        if (sourceStats.size === targetStats.size) {
          return {
            filesUnchanged: 1,
          };
        }
      }
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }

    const [ reader, writer ] = await Promise.all([
      this.song.open(),
      this.targetAdapter.createWriter(this.song.originalPath)
    ]);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
      reader.pipe(writer);
    });

    return {
      filesCreated: 1,
      bytesTransferred: sourceStats.size,
    };
  }

  dryRun() {
    console.log('SYNC: %s', this.song.originalPath);
  }
}
