import { Engine, EngineOptions, LibraryAdapter, SynchronizationResult, TargetAdapter, Task, TaskResult } from './model';
import { CopyTask, CreatePlaylistTask, DeleteTask } from './tasks';
import * as Queue from 'promise-queue';
import {
  Execution,
  EventListener,
  TaskGroupStartedEvent,
  TaskGroupCompletedEvent,
  TaskStartedEvent,
  TaskCompletedEvent,
  TaskFailedEvent,
} from './plugin-api';

interface TaskGroup {
  readonly label: string;
  readonly tasks: Task[];
}

export class Synchrotron implements Engine {
  static extensionPoints = ['library-adapter', 'target-adapter'];

  libraryAdapter: LibraryAdapter;
  targetAdapter: TargetAdapter;

  constructor(readonly options: EngineOptions) {}

  execute(): Execution {
    return new ExecutionImpl({ options: this.options, libraryAdapter: this.libraryAdapter, targetAdapter: this.targetAdapter });
  }
}

class ExecutionImpl implements Execution {
  private readonly options: EngineOptions;
  private readonly libraryAdapter: LibraryAdapter;
  private readonly targetAdapter: TargetAdapter;
  private readonly queue: Queue;
  private readonly listeners: { [type: string]: EventListener<any>[] } = {};

  constructor({
    options,
    libraryAdapter,
    targetAdapter,
  }: {
    options: EngineOptions;
    libraryAdapter: LibraryAdapter;
    targetAdapter: TargetAdapter;
  }) {
    this.options = options;
    this.libraryAdapter = libraryAdapter;
    this.targetAdapter = targetAdapter;
    // TODO make concurrency configurable
    this.queue = new Queue(4);
    this.run();
  }

  on(type: string, listener: EventListener<any>) {
    (this.listeners[type] = this.listeners[type] || []).push(listener);
  }

  private emit(type: string, payload: any) {
    (this.listeners[type] || []).forEach(listener => listener(payload));
  }

  private async run() {
    try {
      const groups = await this.createTaskGroups();
      const results = await this.executeTaskGroups(groups);
      this.emit('done', results);
    } catch (error) {
      this.emit('error', error);
    }
  }

  private async createTaskGroups(): Promise<TaskGroup[]> {
    const groups: TaskGroup[] = [];

    const library = await this.libraryAdapter.loadLibrary();
    const copyTasks = library.songs.map(song => new CopyTask(song, this.targetAdapter));
    if (copyTasks.length) groups.push({ label: 'synchronizing', tasks: copyTasks });

    const createPlaylistTasks = library.playlists.map(p => new CreatePlaylistTask(p, this.targetAdapter));
    if (createPlaylistTasks.length) groups.push({ label: 'playlists', tasks: createPlaylistTasks });

    const deleteFiles = await this.targetAdapter.getFilesToDelete([
      ...library.songs.map(s => s.originalPath),
      ...createPlaylistTasks.map(t => t.filename),
    ]);
    if (deleteFiles.length) groups.push({ label: 'deleting', tasks: deleteFiles.map(f => new DeleteTask(f, this.targetAdapter)) });

    return groups;
  }

  private async executeTaskGroups(groups: TaskGroup[]): Promise<SynchronizationResult> {
    const groupCount = groups.length;
    let groupIndex = 0;
    let results: TaskResult[] = [];
    const startedAt = Date.now();

    for (const { label, tasks } of groups) {
      this.emit('data', { type: 'task_group_started', label, groupIndex, groupCount, taskCount: tasks.length } as TaskGroupStartedEvent);
      const taskCount = tasks.length;
      const groupResults = await Promise.all(
        tasks.map(async (t, taskIndex) => {
          const result = await this.scheduleTask(t, taskIndex, taskCount);
          return result;
        })
      );
      this.emit('data', { type: 'task_group_completed', groupIndex } as TaskGroupCompletedEvent);
      results = [...results, ...groupResults];
      groupIndex++;
    }

    return mergeResults(results, Date.now() - startedAt);
  }

  private scheduleTask(task: Task, taskIndex: number, taskCount: number): Promise<TaskResult> {
    return this.queue.add(() => this.executeTask(task, taskIndex, taskCount));
  }

  private executeTask(task: Task, taskIndex: number, taskCount: number): Promise<TaskResult> {
    this.emit('data', { type: 'task_started', taskIndex, taskCount, task } as TaskStartedEvent);
    try {
      const result = this.options.dryRun ? task.dryRun() : task.execute();
      this.emit('data', { type: 'task_completed', taskIndex } as TaskCompletedEvent);
      return result;
    } catch (error) {
      this.emit('data', { type: 'task_failed', taskIndex, error } as TaskFailedEvent);
      throw error;
    }
  }
}

function mergeResults(results: TaskResult[], timeMillis: number): SynchronizationResult {
  return {
    ...results.reduce(
      (a, b) => ({
        files: [...(a.files || []), ...(b.files || [])],
        playlists: [...(a.playlists || []), ...(b.playlists || [])],
      }),
      {}
    ),
    timeMillis,
  } as SynchronizationResult;
}
