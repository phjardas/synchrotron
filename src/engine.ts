import * as bytes from 'bytes';
import * as duration from 'humanize-duration';
import { Engine, LibraryAdapter, TaskResult, EngineOptions, Task, TargetAdapter } from './model';


interface TaskGroup {
  readonly label: string;
  readonly tasks: Task[];
}


export class Synchrotron implements Engine {
  static extensionPoints = ['library-adapter', 'target-adapter'];

  libraryAdapter: LibraryAdapter;
  targetAdapter: TargetAdapter;

  constructor(private readonly options: EngineOptions) {}

  async execute(): Promise<TaskResult> {
    const { logger } = this.options;

    logger.debug('starting synchronization');
    logger.debug('analyzing...')
    const groups = await this.createTaskGroups();
    const results = await this.executeTaskGroups(groups);
    this.printResults(results);
    return results;
  }


  private async createTaskGroups(): Promise<TaskGroup[]> {
    const groups: TaskGroup[] = [];

    const library = await this.libraryAdapter.loadLibrary();
    const copyTasks = library.songs.map(song => this.targetAdapter.createCopyTask(song));
    if (copyTasks.length) groups.push({ label: 'synchronizing', tasks: copyTasks });

    const createPlaylistTasks = library.playlists.map(p => this.targetAdapter.createPlaylistTask(p));
    if (createPlaylistTasks.length) groups.push({ label: 'playlists', tasks: createPlaylistTasks });
    
    const deleteTasks = await this.targetAdapter.createDeleteTasks(library.songs);
    if (deleteTasks.length) groups.push({ label: 'deleting', tasks: deleteTasks });

    return groups;
  }


  private async executeTaskGroups(groups: TaskGroup[]): Promise<TaskResult> {
    const { logger } = this.options;
    let results: TaskResult[] = [];
    const startedAt = Date.now();

    for (const { label, tasks } of groups) {
      const progress = logger.startProgress(label, tasks.length);
      const groupResults = await Promise.all(tasks.map(async t => {
        const result = await this.executeTask(t);
        progress.tick();
        return result;
      }));
      results = [...results, ...groupResults];

      progress.terminate();
    }

    return { ...this.mergeResults(results), timeMillis: Date.now() - startedAt };
  }


  private executeTask(task: Task): Promise<TaskResult> {
    if (this.options.dryRun) {
      task.dryRun();
      return Promise.resolve({});
    }

    return task.execute();
  }


  private mergeResults(results: TaskResult[]): TaskResult {
    return results.reduce((a, b) => ({
      filesCreated: (a.filesCreated || 0) + (b.filesCreated || 0),
      filesDeleted: (a.filesDeleted || 0) + (b.filesDeleted || 0),
      filesUnchanged: (a.filesUnchanged || 0) + (b.filesUnchanged || 0),
      playlistsCreated: (a.playlistsCreated || 0) + (b.playlistsCreated || 0),
      playlistsDeleted: (a.playlistsDeleted || 0) + (b.playlistsDeleted || 0),
      playlistsUnchanged: (a.playlistsUnchanged || 0) + (b.playlistsUnchanged || 0),
      bytesTransferred: (a.bytesTransferred || 0) + (b.bytesTransferred || 0),
      timeMillis: (a.timeMillis || 0) + (b.timeMillis || 0),
    }), {});
  }

  private printResults(results: TaskResult) {
    const { logger } = this.options;

    logger.info('Files: %d created, %d unchanged, %d deleted', results.filesCreated, results.filesUnchanged, results.filesDeleted);
    logger.info('Playlists: %d created, %d unchanged, %d deleted', results.playlistsCreated, results.playlistsUnchanged, results.playlistsDeleted);
    logger.info('Total transferred: %s', bytes(results.bytesTransferred));
    logger.info('Total duration: %s', duration(results.timeMillis));
  }
}
