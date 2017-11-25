import { Logger } from './logger';
export { Logger } from './logger';

export interface Options {
  verbose: boolean;
  quiet: boolean;
  /** If set, the tasks are not actually executed but only log their intent. */
  dryRun: boolean;
  extensions: { [key: string]: string };
}

export interface EngineOptions extends Options {
  logger: Logger;
}

export interface Library {
  readonly songs: Song[];
  readonly playlists: Playlist[];
}

export interface Song {
  readonly absoluteFilename: string;
  readonly relativeFilename: string;
}

export interface Playlist {
  readonly name: string;
  readonly songs: Song[];
}

export interface LibraryAdapter {
  loadLibrary(): Promise<Library>;
}

export interface TargetAdapter {
  createCopyTask(song: Song): Task;
  createPlaylistTask(playlist: Playlist): Task;
  createDeleteTasks(songs: Song[]): Task[] | Promise<Task[]>;
}

export interface Engine {
  libraryAdapter: LibraryAdapter;
  targetAdapter: TargetAdapter;
  execute(): Promise<TaskResult>;
}

export interface Task {
  execute(): Promise<TaskResult>;
  dryRun(): void;
}

export interface TaskResult {
  readonly filesCreated?: number;
  readonly filesDeleted?: number;
  readonly filesUnchanged?: number;
  readonly playlistsCreated?: number;
  readonly playlistsDeleted?: number;
  readonly playlistsUnchanged?: number;
  readonly bytesTransferred?: number;
  readonly timeMillis?: number;
}
