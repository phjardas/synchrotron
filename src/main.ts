import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { promisify } from 'util';
import * as xml2js from 'xml2js';
import * as mkdirp from 'mkdirp';


const copyFile = promisify(fs.copyFile);
const deleteFile = promisify(fs.unlink);
const getFileStats = promisify(fs.stat);


const config = {
  rhythmboxConfigDir: '/home/phjardas/.local/share/rhythmbox',
  libraryDir: '/home/phjardas/Music',
  targetDir: '/tmp/Music',
  //  targetDir: '/media/phjardas/Music',
  playlistNames: ['Music','Soundtrack'],
};


interface Playlist {
  readonly name: string;
  readonly files: string[];
}

interface Task {
  execute(): Promise<TaskResult>;
}

class CopyTask implements Task {
  constructor(private readonly source: string, private readonly target: string) {}

  async execute(): Promise<TaskResult> {
    const startedAt = Date.now();
    const sourceStats = await getFileStats(this.source);

    try {
      const targetStats = await getFileStats(this.target);

      if (sourceStats.isFile && targetStats.isFile) {
        if (sourceStats.size === targetStats.size) {
          return {
            filesUnchanged: 1,
            timeMillis: Date.now() - startedAt,
          };
        }
      }
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }

    const p = path.parse(this.target);
    await promisify(mkdirp)(p.dir);
    await copyFile(this.source, this.target);
    return {
      filesCreated: 1,
      bytesTransferred: sourceStats.size,
      timeMillis: Date.now() - startedAt,
    };
  }
}

class DeleteTask implements Task {
  constructor(private readonly file: string) {}

  async execute(): Promise<TaskResult> {
    await deleteFile(this.file);

    return {
      filesDeleted: 1,
    };    
  }
}

interface TaskResult {
  filesCreated?: number;
  filesDeleted?: number;
  filesUnchanged?: number;
  playlistsCreated?: number;
  playlistsDeleted?: number;
  playlistsUnchanged?: number;
  bytesTransferred?: number;
  timeMillis?: number;
}


async function loadPlaylists(): Promise<Playlist[]> {
  const parseXml: (xml: string) => Promise<any> = xml => new Promise((resolve, reject) => {
    xml2js.parseString(xml, (err, result) => err ? reject(err) : resolve(result));
  });

  const playlistsFile = `${config.rhythmboxConfigDir}/playlists.xml`;

  const xml = await promisify(fs.readFile)(playlistsFile, 'utf8');
  const data = await parseXml(xml);

  return data['rhythmdb-playlists'].playlist
    .filter(el => el.$.type === 'static')
    .map(el => {
      return {
        name: el.$.name,
        files: el.location,
      };
    });
}


async function loadSelectedPlaylists(): Promise<Playlist[]> {
  const playlists = await loadPlaylists();
  return playlists.filter(p => config.playlistNames.indexOf(p.name) >= 0);
}


function getSelectedFiles(playlists: Playlist[]): string[] {
  let files = playlists.map(p => p.files).reduce((a, b) => a.concat(b), []);
  files = Array.from(new Set(files)).sort();

  const prefix = `file://${config.libraryDir}/`;

  files = files.filter(f => f && f.startsWith(prefix))
    .map(f => f.replace(prefix, ''))
    .map(decodeURI);

  return files;
}


async function findFilesToDelete(files: string[]): Promise<string[]> {
  const targetFiles = await promisify(glob)('**/*', { cwd: config.targetDir, nodir: true });
  return targetFiles.filter(f => files.indexOf(f) < 0);
}


async function createTasks(): Promise<Task[]> {
  const playlists = await loadSelectedPlaylists();
  const files = getSelectedFiles(playlists);
  const copyTasks: Task[] = files.map(file => new CopyTask(`${config.libraryDir}/${file}`, `${config.targetDir}/${file}`));
  const deleteTasks: Task[] = (await findFilesToDelete(files)).map(file => new DeleteTask(`${config.targetDir}/${file}`));
  return copyTasks.concat(deleteTasks);
}


async function executeTask(task: Task): Promise<TaskResult> {
  return await task.execute();
}


function mergeResults(results: TaskResult[]): TaskResult {
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


async function main() {
  try {
    console.log('analyzing...')
    const tasks = await createTasks();
    console.log('synchronizing %d files...', tasks.length);
    const results = await Promise.all(tasks.map(executeTask));
    const result = mergeResults(results);
    console.log('done.');
    console.log(result);
  } catch (err) {
    console.error('ERROR:', err);
  }
}


main();
