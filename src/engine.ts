import { Engine, LibraryAdapter, TaskResult, Options, Task, TargetAdapter } from './model';


export class Synchrotron implements Engine {
  static extensionPoints = ['library-adapter', 'target-adapter'];

  libraryAdapter: LibraryAdapter;
  targetAdapter: TargetAdapter;

  constructor(private readonly options: Options) {}

  async execute(): Promise<TaskResult> {
    console.log('starting synchronization');
    console.log();
    console.log('analyzing...')
    const tasks = await this.createTasks();
    console.log('running %d tasks...', tasks.length);
    const results = await Promise.all(tasks.map(t => this.executeTask(t)));
    const result = this.mergeResults(results);
    console.log('done.');
    console.log();
    return result;
  }


  private async createTasks(): Promise<Task[]> {
    const library = await this.libraryAdapter.loadLibrary();
    const copyTasks = library.songs.map(song => this.targetAdapter.createCopyTask(song));
    const createPlaylistTasks = library.playlists.map(p => this.targetAdapter.createPlaylistTask(p));
    const deleteTasks = await this.targetAdapter.createDeleteTasks(library.songs);

    return [
      ...copyTasks,
      ...createPlaylistTasks,
      ...deleteTasks,
    ];
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
}
