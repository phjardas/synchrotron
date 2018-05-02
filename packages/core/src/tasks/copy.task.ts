import * as bytes from 'bytes';

import { Task, TaskResult, TargetAdapter, Song } from '../model';

export class CopyTask implements Task {
  constructor(private readonly song: Song, private readonly targetAdapter: TargetAdapter) {}

  async execute(): Promise<TaskResult> {
    try {
      const { skip, size } = await this.getStats();
      if (skip) {
        return { filesUnchanged: 1 };
      }

      const [reader, writer] = await Promise.all([this.song.open(), this.targetAdapter.createWriter(this.song.originalPath)]);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
        reader.pipe(writer);
      });

      return { filesCreated: 1, bytesTransferred: size };
    } catch (err) {
      console.error('Error copying: ' + err, err);
      return { filesFailed: 1 };
    }
  }

  async dryRun(): Promise<TaskResult> {
    const { skip, size } = await this.getStats();
    if (skip) {
      console.log('SKIP: %s', this.song.originalPath);
      return { filesUnchanged: 1 };
    }

    console.log('COPY: %s (%s)', this.song.originalPath, bytes(size));
    return { filesCreated: 1, bytesTransferred: size };
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
