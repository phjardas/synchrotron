import * as fs from 'fs';
import * as yargs from 'yargs';

import { Options } from './model';

export function parseOptions(args: string[]): Options {
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

  const options = yargs(args)
    .version(pkg.version)
    .config()
    .option('rhythmbox-config-dir', { demandOption: true, describe: 'path to the configuration directory of Rhythmbox, usually at `~/.local/share/rhythmbox`' })
    .option('library-dir', { demandOption: true, describe: 'path to your music library, eg. `~/Music' })
    .option('target-dir', { demandOption: true, describe: 'path to which to sync to, eg. `/media/USB-Stick`' })
    .option('playlists', { array: true, describe: 'names of playlists to synchronize, omit to synchronize all playlists' })
    .argv;

  return {
    rhythmboxConfigDir: options.rhythmboxConfigDir,
    libraryDir: options.libraryDir,
    targetDir: options.targetDir,
    playlists: options.playlists,
  };
}
