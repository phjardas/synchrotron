import * as path from 'path';
import { Plugin, Extension } from './plugin';


export interface PluginManager {
  readonly plugins: Promise<Plugin[]>;
  readonly extensions: Promise<Extension[]>;
  getExtension(type: string, id: string): Promise<Extension>;
}


class PluginManagerImpl implements PluginManager {
  private _plugins: Promise<Plugin[]>;
  private _extensions: Promise<Extension[]>;

  private async loadPlugin(path: string): Promise<Plugin> {
    try {
      const p = require(path);
      return p.default || p;
    } catch (err) {
      console.error(`Error loading plugin from ${path}:`, err);
    }
  }

  private discoverPlugins(): Promise<Plugin[]> {
    // FIXME resolve plugins
    const plugins = ['filesystem', 'rhythmbox']
      .map(pluginId => path.resolve(__dirname, '..', '..', `synchrotron-${pluginId}-plugin`, 'dist'))
      .map(path => this.loadPlugin(path));

    return Promise.all(plugins);
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

export const pluginManager: PluginManager = new PluginManagerImpl();
