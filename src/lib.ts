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
    return getFileStats(this.absoluteFilename)
      .then(stats => ({
        get exists() { return stats.isFile(); },
        size: stats.size,
      }));
  }

  async open(): Promise<Readable> {
    return fs.createReadStream(this.absoluteFilename);
  }
}
