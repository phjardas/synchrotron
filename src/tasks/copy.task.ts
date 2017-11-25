import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { mkdirs, copyFile } from './helpers';
import { Task, TaskResult } from "../model";


const getFileStats = promisify(fs.stat);


export class CopyTask implements Task {
  constructor(private readonly source: string, private readonly target: string) { }

  async execute(): Promise<TaskResult> {
    const startedAt = Date.now();
    const sourceStats = await getFileStats(this.source);

    try {
      const targetStats = await getFileStats(this.target);

      if (sourceStats.isFile && targetStats.isFile) {
        if (sourceStats.size === targetStats.size) {
          return {
            filesUnchanged: 1,
            timeMillis: Date.now() - startedAt,
          };
        }
      }
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }

    const p = path.parse(this.target);
    await mkdirs(p.dir);
    await copyFile(this.source, this.target);
    return {
      filesCreated: 1,
      bytesTransferred: sourceStats.size,
      timeMillis: Date.now() - startedAt,
    };
  }

  dryRun() {
    console.log('COPY %s --> %s', this.source, this.target);
  }
}
