import { Extension, Plugin } from './plugin-api';
import * as plugins from './plugins';

export class PluginManager {
  private _extensions: Promise<Extension[]>;

  get plugins(): Plugin[] {
    return Object.keys(plugins).map(p => plugins[p]);
  }

  get extensions(): Promise<Extension[]> {
    if (!this._extensions) {
      this._extensions = Promise.all(this.plugins.map(ps => ps.extensions)).then(exx => exx.reduce((a, b) => a.concat(b), []));
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
