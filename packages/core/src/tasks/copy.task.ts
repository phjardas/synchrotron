import { Song, TargetAdapter, Task, TaskResult } from '../model';

export class CopyTask implements Task {
  constructor(private readonly song: Song, private readonly targetAdapter: TargetAdapter) {}

  async execute(): Promise<TaskResult> {
    try {
      const { skip, size } = await this.getStats();
      if (skip) {
        return { files: [{ type: 'unchanged', name: this.song.originalPath }] };
      }

      const [reader, writer] = await Promise.all([this.song.open(), this.targetAdapter.createWriter(this.song.originalPath)]);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
        reader.pipe(writer);
      });

      return { files: [{ type: 'created', name: this.song.originalPath, bytesTransferred: size }] };
    } catch (error) {
      return { files: [{ type: 'failed', name: this.song.originalPath, error }] };
    }
  }

  async dryRun(): Promise<TaskResult> {
    const { skip, size } = await this.getStats();

    return skip
      ? { files: [{ type: 'unchanged', name: this.song.originalPath }] }
      : { files: [{ type: 'created', name: this.song.originalPath, bytesTransferred: size }] };
  }

  private async getStats(): Promise<{ skip: boolean; size: number }> {
    const sourceStats = await this.song.fileStats;
    const targetStats = await this.targetAdapter.getFileStats(this.song.originalPath);

    return {
      skip: sourceStats.exists && targetStats.exists && sourceStats.size === targetStats.size,
      size: sourceStats.size,
    };
  }
}
