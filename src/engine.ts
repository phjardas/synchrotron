import * as glob from 'glob';
import { promisify } from 'util';

import { Engine, LibraryAdapter, TaskResult, Options, Playlist, Task } from './model';
import { Registry } from './registry';
import { CreatePlaylistTask, CopyTask, DeleteTask } from './tasks/index';


export class Synchrotron implements Engine {
  private readonly libraryAdapters = new Registry<LibraryAdapter>();

  constructor(private readonly options: Options) {}

  registerLibraryAdapter(libraryAdapter: LibraryAdapter) {
    console.log('registering library adapter: %s', libraryAdapter.id);
    this.libraryAdapters.register(libraryAdapter);
  }

  async execute(): Promise<TaskResult> {
    console.log('syncing\n  playlists: %s\n  from: %s\n  to: %s',
      this.options.playlists.join(', '),
      this.options.libraryDir,
      this.options.targetDir);
    console.log();
    console.log('analyzing...')
    const tasks = await this.createTasks();
    console.log('synchronizing %d files...', tasks.length);
    const results = await Promise.all(tasks.map(t => this.executeTask(t)));
    const result = this.mergeResults(results);
    console.log('done.');
    console.log();
    return result;
  }

  private async loadSelectedPlaylists(): Promise<Playlist[]> {
    let playlists = await this.libraryAdapters.get('rhythmbox').loadPlaylists(this.options);
    if (this.options.playlists && this.options.playlists.length) {
      playlists = playlists.filter(p => this.options.playlists.indexOf(p.name) >= 0);
    }
    return playlists;
  }

  private getSelectedFiles(playlists: Playlist[]): string[] {
    const files = playlists.map(p => p.files).reduce((a, b) => a.concat(b), []);
    return Array.from(new Set(files)).sort();
  }

  private async findFilesToDelete(files: string[], playlists: Playlist[]): Promise<string[]> {
    const targetFiles = await promisify(glob)('**/*', { cwd: this.options.targetDir, nodir: true });
    return targetFiles.filter(f => files.indexOf(f) < 0 && !playlists.some(p => f === `${p.name}.m3u8`));
  }


  private async createTasks(): Promise<Task[]> {
    const playlists = await this.loadSelectedPlaylists();
    const files = this.getSelectedFiles(playlists);
    const copyTasks: Task[] = files.map(file => new CopyTask(`${this.options.libraryDir}/${file}`, `${this.options.targetDir}/${file}`));
    const deleteTasks: Task[] = (await this.findFilesToDelete(files, playlists)).map(file => new DeleteTask(`${this.options.targetDir}/${file}`));
    const createPlaylistTasks: Task[] = playlists.map(p => new CreatePlaylistTask(p));
    return copyTasks.concat(deleteTasks).concat(createPlaylistTasks);
  }


  private async executeTask(task: Task): Promise<TaskResult> {
    return await task.execute(this.options);
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
