import * as bytes from 'bytes';
import * as duration from 'humanize-duration';
import { Engine, LibraryAdapter, TaskResult, EngineOptions, Task, TargetAdapter } from './model';
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

  async execute(): Promise<TaskResult> {
    const { logger } = this.options;

    try {
      logger.debug('starting synchronization');
      logger.debug('analyzing...')
      const groups = await this.createTaskGroups();
      const results = await this.executeTaskGroups(groups);
      this.printResults(results);
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
    
    const deleteFiles = await this.targetAdapter.getFilesToDelete([...library.songs.map(s => s.originalPath), ...createPlaylistTasks.map(t => t.filename)]);
    if (deleteFiles.length) groups.push({ label: 'deleting', tasks: deleteFiles.map(f => new DeleteTask(f, this.targetAdapter)) });

    return groups;
  }


  private async executeTaskGroups(groups: TaskGroup[]): Promise<TaskResult> {
    const { logger } = this.options;
    let progress = this.options.noProgress ? null : logger.startProgress(groups.reduce((a, g) => a + g.tasks.length, 0));
    let results: TaskResult[] = [];
    const startedAt = Date.now();

    for (const { label, tasks } of groups) {
      const groupResults = await Promise.all(tasks.map(async t => {
        const result = await this.executeTask(t);
        progress && progress.tick(1, { task: label });
        return result;
      }));
      results = [...results, ...groupResults];
    }

    progress && progress.terminate();

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

    logger.info('\n');
    logger.info('Files: %d created, %d unchanged, %d deleted', results.filesCreated, results.filesUnchanged, results.filesDeleted);
    logger.info('Playlists: %d created, %d unchanged, %d deleted', results.playlistsCreated, results.playlistsUnchanged, results.playlistsDeleted);
    logger.info('Total transferred: %s', bytes(results.bytesTransferred));
    logger.info('Total duration: %s', duration(results.timeMillis));
  }
}
