import { Extension, Plugin } from '@synchrotron/plugin-api';

const pluginNames = ['@synchrotron/rhythmbox-plugin', '@synchrotron/filesystem-plugin', '@synchrotron/playlist-plugin'];

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

  private async discoverPlugins(): Promise<Plugin[]> {
    return Promise.all(pluginNames.map(p => this.loadPlugin(p)));
  }

  get plugins(): Promise<Plugin[]> {
    if (!this._plugins) {
      this._plugins = this.discoverPlugins();
    }

    return this._plugins;
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
