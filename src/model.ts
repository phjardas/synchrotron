import { Logger } from './logger';
import { Readable, Writable } from 'stream';

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

export interface FileStats {
  readonly exists: boolean;
  readonly size?: number;
}

export interface Song {
  readonly artist?: string;
  readonly albumArtist?: string;
  readonly album?: string;
  readonly title?: string;
  readonly originalPath: string;
  readonly fileStats: Promise<FileStats>;
  open(): Promise<Readable>;
}

export interface Playlist {
  readonly name: string;
  readonly songs: Song[];
}

export interface LibraryAdapter {
  loadLibrary(): Promise<Library>;
}

export interface TargetAdapter {
  getFileStats(path: string): Promise<FileStats>;
  createWriter(path: string, options?: {
    encoding: string;
  }): Promise<Writable>;
  getFilesToDelete(songs: Song[]): Promise<string[]>;
  deleteFile(path: string): Promise<void>;
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
