import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Writable } from 'stream';
import * as mkdirp from 'mkdirp';

import { TargetAdapter, FileStats } from '@synchrotron/plugin-api';

const getFileStats = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const mkdirs = promisify(mkdirp);

export interface FilesystemTargetAdapterOptions {
  readonly targetDir: string;
}

export class FilesystemTargetAdapter implements TargetAdapter {
  constructor(private opts: FilesystemTargetAdapterOptions) {}

  private sanitize(file: string): string {
    return file.replace(/[:\(\)]/g, '_');
  }

  getPlaylistPath(file: string): string {
    return this.sanitize(path.resolve(this.opts.targetDir, file));
  }

  async getFileStats(file: string): Promise<FileStats> {
    try {
      const stats = await getFileStats(this.getPlaylistPath(file));
      return {
        get exists() {
          return stats.isFile();
        },
        size: stats.size,
      };
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      return { exists: false };
    }
  }

  async createWriter(file: string, options?: { encoding: string }): Promise<Writable> {
    const abs = this.getPlaylistPath(file);
    await mkdirs(path.parse(abs).dir);
    return fs.createWriteStream(abs, options);
  }

  async getFilesToDelete(files: string[]): Promise<string[]> {
    const targetFiles = await promisify(glob)('**/*', {
      cwd: this.opts.targetDir,
      nodir: true,
    });
    return targetFiles.filter(f => files.indexOf(f) < 0);
  }

  deleteFile(file: string): Promise<void> {
    return unlink(this.getPlaylistPath(file));
  }
}
