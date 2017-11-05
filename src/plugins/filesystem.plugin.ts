import * as glob from 'glob';
import { promisify } from 'util';
import { Arguments } from 'yargs';

import { Plugin, Extension } from '../plugin';
import { Engine, TargetAdapter, Song, Task, Playlist } from '../model';
import { CopyTask, DeleteTask, CreatePlaylistTask } from '../tasks';


class FilesystemTargetAdapterExtension implements Extension {
  type = 'target-adapter';
  id = 'filesystem';

  addCommandLineOptions(yargs: Arguments): Arguments {
    return yargs.option('target-dir', { demandOption: true, describe: 'The target directory to which to synchronize files to' });
  }

  extend(engine: Engine, args: any): Engine {
    const opts: FilesystemTargetAdapterOptions = {
      targetDir: args['target-dir'],
    };
    
    engine.targetAdapter = new FilesystemTargetAdapter(opts);
    return engine;
  }
}


interface FilesystemTargetAdapterOptions {
  readonly targetDir: string;
}


class FilesystemTargetAdapter implements TargetAdapter {
  constructor(private opts: FilesystemTargetAdapterOptions) {}

  createCopyTask(song: Song): Task {
    const target = `${this.opts.targetDir}/${song.relativeFilename}`;
    return new CopyTask(song.absoluteFilename, target);
  }

  createPlaylistTask(playlist: Playlist): Task {
    return new CreatePlaylistTask(playlist, this.opts.targetDir);
  }

  async createDeleteTasks(songs: Song[]): Promise<Task[]> {
    const files = songs.map(song => song.relativeFilename);
    const targetFiles = await promisify(glob)('**/*', { cwd: this.opts.targetDir, nodir: true });
    return targetFiles
      .filter(f => files.indexOf(f) < 0)
      .map(f => new DeleteTask(`${this.opts.targetDir}/${f}`));
  }
}


const plugin: Plugin = {
  id: 'filesystem',
  version: '0.1.0',
  name: 'Filesystem',
  description: 'Writes files directly to the file system',
  author: 'Philipp Jardas <philipp@jardas.de>',
  extensions: [
    new FilesystemTargetAdapterExtension(),
  ],
}

export default plugin;
