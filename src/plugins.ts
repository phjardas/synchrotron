import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import * as findNodeModules from 'find-node-modules';

import { Plugin, Extension } from './plugin';

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);


export class PluginManager {
  private _plugins: Promise<Plugin[]>;
  private _extensions: Promise<Extension[]>;

  private async loadPlugin(name: string): Promise<Plugin> {
    try {
      const p = require(name);
      return p.default || p;
    } catch (err) {
      console.error(`Error loading plugin ${name}:`, err);
      throw new Error(`Error loading plugin ${name}: ${err.message}`);
    }
  }

  private async discoverPluginsFrom(repo: string): Promise<string[]> {
    const abs = path.resolve(__dirname, repo);
    const files = await readdir(abs);
    const stats = await Promise.all(
      files.map(file => path.resolve(abs, file))
      .map(async file => ({ file: path.parse(file), stats: await stat(file) }))
    );
    
    const dirs = stats.filter(s =>
      s.stats.isDirectory() &&
      s.file.name.startsWith('synchrotron-') &&
      s.file.name.endsWith('-plugin')
    )
    
    return await Promise.all(dirs.map(s => s.file.name));
  }

  private async discoverPlugins(): Promise<Plugin[]> {
    const modules: string[] = findNodeModules(__dirname);
    const pluginNames = (await Promise.all(modules.map(d => this.discoverPluginsFrom(d))))
      .reduce((a, b) => [...a, ...b], []);
    return Promise.all(pluginNames.map(p => this.loadPlugin(p)));
  }

  get plugins(): Promise<Plugin[]> {
    if (!this._plugins) {
      this._plugins = this.discoverPlugins();
    }

    return this._plugins
  }

  get extensions(): Promise<Extension[]> {
    if (!this._extensions) {
      this._extensions = this.plugins
        .then(ps => Promise.all(ps.map(ps => ps.extensions)))
        .then(exx => exx.reduce((a, b) => a.concat(b), []));
    }

    return this._extensions;
  }

  getExtension(type: string, id: string): Promise<Extension> {
    return this.extensions
      .then(exs => exs.filter(e => e.type === type && e.id === id))
      .then(exs => {
        if (exs.length === 1) return exs[0];
        if (exs.length === 0) throw new Error(`No extension of type ${type} found for id ${id}`);
        throw new Error(`More than one extension of type ${type} found for id ${id}`);
      });
  }
}
