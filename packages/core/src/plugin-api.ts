import { Readable, Writable } from 'stream';

export interface Task {
  execute(): Promise<TaskResult>;
  dryRun(): Promise<TaskResult>;
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

export interface Library {
  readonly songs: Song[];
  readonly playlists: Playlist[];
}

export interface LibraryAdapter {
  loadLibrary(): Promise<Library>;
}

export interface TargetAdapter {
  getFileStats(path: string): Promise<FileStats>;
  createWriter(
    path: string,
    options?: {
      encoding: string;
    }
  ): Promise<Writable>;
  getPlaylistPath(path: string): string;
  getFilesToDelete(files: string[]): Promise<string[]>;
  deleteFile(path: string): Promise<void>;
}

export type FileCreated = {
  type: 'created';
  name: string;
  bytesTransferred?: number;
};
export type FileDeleted = {
  type: 'deleted';
  name: string;
};
export type FileUnchanged = {
  type: 'unchanged';
  name: string;
};
export type FileFailed = {
  type: 'failed';
  name: string;
  error: Error;
};
export type FileResult = FileCreated | FileDeleted | FileUnchanged | FileFailed;

export interface TaskResult {
  readonly files?: FileResult[];
  readonly playlists?: FileResult[];
}

export interface SynchronizationResult {
  readonly files: FileResult[];
  readonly playlists: FileResult[];
  readonly timeMillis: number;
}

export interface Engine {
  libraryAdapter: LibraryAdapter;
  targetAdapter: TargetAdapter;
  execute(): Promise<SynchronizationResult>;
}

export interface Plugin {
  readonly id: string;
  readonly version: string;
  readonly name: string;
  readonly description: string;
  readonly author: string;
  readonly extensions: Extension[] | Promise<Extension[]>;
}

export interface Extension {
  readonly type: string;
  readonly id: string;
  readonly options?: OptionSpec[];
  extend(engine: Engine, args: ParsedOptions): Engine;
}

export type OptionType = 'string' | 'directory' | 'files';

export interface OptionSpec {
  id: string;
  label: string;
  type: OptionType;
  required?: boolean;
  description?: string;
}

export type ParsedOptions = {
  [id: string]: string;
};
