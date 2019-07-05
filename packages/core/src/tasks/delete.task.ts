import { TargetAdapter, Task, TaskResult } from '../model';

export class DeleteTask implements Task {
  constructor(private readonly file: string, private readonly targetAdapter: TargetAdapter) {}

  async execute(): Promise<TaskResult> {
    await this.targetAdapter.deleteFile(this.file);
    return { files: [{ type: 'deleted', name: this.file }] };
  }

  async dryRun(): Promise<TaskResult> {
    return { files: [{ type: 'deleted', name: this.file }] };
  }
}
