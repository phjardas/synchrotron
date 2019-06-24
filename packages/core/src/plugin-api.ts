import { Readable, Writable } from 'stream';

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

export interface TaskResult {
  readonly filesCreated?: number;
  readonly filesDeleted?: number;
  readonly filesUnchanged?: number;
  readonly filesFailed?: number;
  readonly playlistsCreated?: number;
  readonly playlistsDeleted?: number;
  readonly playlistsUnchanged?: number;
  readonly bytesTransferred?: number;
  readonly timeMillis?: number;
}

export interface Engine {
  libraryAdapter: LibraryAdapter;
  targetAdapter: TargetAdapter;
  execute(): Promise<TaskResult>;
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