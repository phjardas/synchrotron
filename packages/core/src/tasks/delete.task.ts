import { Task, TaskResult, TargetAdapter } from "../model";


export class DeleteTask implements Task {
  constructor(
    private readonly file: string,
    private readonly targetAdapter: TargetAdapter
  ) {}

  async execute(): Promise<TaskResult> {
    await this.targetAdapter.deleteFile(this.file);

    return {
      filesDeleted: 1,
    };
  }

  dryRun() {
    console.log('DELETE: %s', this.file);
  }
}
