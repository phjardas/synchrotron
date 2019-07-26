import * as bytes from 'bytes';
import * as duration from 'humanize-duration';
import * as ProgressBar from 'progress';
import { Event, Execution, FileCreated, FileResult, SynchronizationResult, TaskGroupStartedEvent, FileFailed } from 'synchrotron-core';

export function createLogger(execution: Execution) {
  const state = new ExecutionState();
  execution.on('done', printResults);
  execution.on('error', error => console.error(error));
  execution.on('data', event => state.handle(event));
}

class ExecutionState {
  private progress?: ProgressBar;

  handle(event: Event) {
    switch (event.type) {
      case 'task_group_started':
        return this.handleTaskGroupStarted(event);
      case 'task_group_completed':
        return this.handleTaskGroupCompleted();
      case 'task_completed':
      case 'task_failed':
        return this.handleTaskFinished();
    }
  }

  private handleTaskGroupStarted({ label, taskCount }: TaskGroupStartedEvent) {
    this.progress && this.progress.terminate();
    this.progress = new ProgressBar(`${label} [:bar] :percent :rate/s :etas`, {
      total: taskCount,
      width: process.stdout.columns - 40,
      complete: '=',
      incomplete: ' ',
    });
  }

  private handleTaskGroupCompleted() {
    if (this.progress) {
      this.progress.terminate();
      delete this.progress;
    }
  }
  private handleTaskFinished() {
    this.progress && this.progress.tick();
  }
}

function printResults(results: SynchronizationResult) {
  console.log('\n');
  printStatistics('Files', results.files);
  printStatistics('Playlists', results.playlists);
  console.log(
    'Total transferred: %s',
    bytes(
      results.files
        .filter(f => f.type === 'created')
        .map((f: FileCreated) => f.bytesTransferred)
        .reduce((a, b) => a + b, 0)
    )
  );
  console.log('Total duration: %s', duration(results.timeMillis));

  const failedFiles = results.files.filter(r => r.type === 'failed') as FileFailed[];
  if (failedFiles.length) {
    printFailedFiles(failedFiles);
  }
}

function printStatistics(label: string, results: FileResult[]) {
  console.log(
    '%s: %d created, %d unchanged, %d deleted, %d failed',
    label,
    results.filter(r => r.type === 'created').length,
    results.filter(r => r.type === 'unchanged').length,
    results.filter(r => r.type === 'deleted').length,
    results.filter(r => r.type === 'failed').length
  );
}

function printFailedFiles(files: FileFailed[]) {
  console.log('\nFailed files:');
  files.forEach(file => console.log(' - %s\n   -> %s', file.name, file.error.message));
}
