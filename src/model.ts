export interface Options {
  readonly rhythmboxConfigDir: string;
  readonly libraryDir: string;
  readonly targetDir: string;
  readonly playlists?: string[];
}

export interface Playlist {
  readonly name: string;
  readonly files: string[];
}

export interface Pluggable {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

export interface Plugin extends Pluggable {
  applyTo(engine: Engine): void;
}

export interface LibraryAdapter extends Pluggable {
  loadPlaylists(options: Options): Promise<Playlist[]>;
}

export interface Engine {
  registerLibraryAdapter(libraryAdapter: LibraryAdapter): void;
}

export interface Task {
  execute(options: Options): Promise<TaskResult>;
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
