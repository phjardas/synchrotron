import * as fs from 'fs';
import { Readable } from 'stream';
import { promisify } from 'util';
import { FileStats, Song } from './plugin-api';

const getFileStats = promisify(fs.stat);

export class FileSystemSong implements Song {
  constructor(public readonly absoluteFilename: string, public readonly originalPath: string) {}

  get fileStats(): Promise<FileStats> {
    return (async () => {
      try {
        const stats = await getFileStats(this.absoluteFilename);
        return {
          exists: stats.isFile(),
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
