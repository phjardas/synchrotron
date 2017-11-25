import * as fs from 'fs';
import { promisify } from 'util';
import * as mkdirp from 'mkdirp';
import * as tmp from 'tmp';

const fsWriteFile = promisify(fs.writeFile);
const createTempFile = promisify(tmp.file);

export const copyFile = promisify(fs.copyFile);
export const mkdirs = promisify(mkdirp);

export async function writeFile(filename: string, data: any, options: { encoding?: string | null; mode?: number | string; flag?: string; } | string | undefined | null): Promise<any> {
  const tmp = await createTempFile({ prefix: `synchrotron-playlist-` });
  await fsWriteFile(tmp, data, options);
  return copyFile(tmp, filename);
}
