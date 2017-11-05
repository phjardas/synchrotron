import * as fs from 'fs';
import { promisify } from 'util';

import { Task, TaskResult } from "../model";


const deleteFile = promisify(fs.unlink);


export class DeleteTask implements Task {
  constructor(private readonly file: string) { }

  async execute(): Promise<TaskResult> {
    await deleteFile(this.file);

    return {
      filesDeleted: 1,
    };
  }

  dryRun() {
    console.log('DELETE: %s', this.file);
  }
}
