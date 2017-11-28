import * as fs from 'fs';
import { Readable } from 'stream';
import { promisify } from 'util';
import { Song, FileStats } from './model';

const getFileStats = promisify(fs.stat);


export abstract class FileSystemSong implements Song {
  constructor(
    public readonly absoluteFilename: string,
    public readonly originalPath: string
  ) {}

  get fileStats(): Promise<FileStats> {
    return (async () => {
      try {
        const stats = await getFileStats(this.absoluteFilename);
        return {
          get exists() { return stats.isFile(); },
          size: stats.size,
        };
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
        return { exists: false };
      }
    })();
  }

  async open(): Promise<Readable> {
    return fs.createReadStream(this.absoluteFilename);
  }
}
