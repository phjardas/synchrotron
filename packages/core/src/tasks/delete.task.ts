import { Task, TaskResult, TargetAdapter } from '../model';

export class DeleteTask implements Task {
  constructor(private readonly file: string, private readonly targetAdapter: TargetAdapter) {}

  async execute(): Promise<TaskResult> {
    await this.targetAdapter.deleteFile(this.file);

    return { filesDeleted: 1 };
  }

  async dryRun(): Promise<TaskResult> {
    console.log('DELETE: %s', this.file);
    return { filesDeleted: 1 };
  }
}
