import { Engine, EngineOptions, LibraryAdapter, SynchronizationResult, TargetAdapter, Task, TaskResult } from './model';
import { CopyTask, CreatePlaylistTask, DeleteTask } from './tasks';

interface TaskGroup {
  readonly label: string;
  readonly tasks: Task[];
}

export class Synchrotron implements Engine {
  static extensionPoints = ['library-adapter', 'target-adapter'];

  libraryAdapter: LibraryAdapter;
  targetAdapter: TargetAdapter;

  constructor(private readonly options: EngineOptions) {}

  async execute(): Promise<SynchronizationResult> {
    const { logger } = this.options;

    try {
      logger.debug('starting synchronization');
      logger.debug('analyzing...');
      const groups = await this.createTaskGroups();
      const results = await this.executeTaskGroups(groups);
      return results;
    } catch (err) {
      logger.error('Error:', err);
      throw err;
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
    const { logger } = this.options;
    let progress = logger.startProgress(groups.reduce((a, g) => a + g.tasks.length, 0));
    let results: TaskResult[] = [];
    const startedAt = Date.now();

    for (const { label, tasks } of groups) {
      const groupResults = await Promise.all(
        tasks.map(async t => {
          const result = await this.executeTask(t);
          progress && progress.tick(1, { task: label });
          return result;
        })
      );
      results = [...results, ...groupResults];
    }

    progress && progress.terminate();

    return mergeResults(results, Date.now() - startedAt);
  }

  private executeTask(task: Task): Promise<TaskResult> {
    return this.options.dryRun ? task.dryRun() : task.execute();
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
