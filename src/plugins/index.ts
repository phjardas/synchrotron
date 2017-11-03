import { Engine, Plugin } from '../model';
import { plugin as rhythmbox } from './rhythmbox.plugin';


async function discoverPlugins(): Promise<Plugin[]> {
  return Promise.resolve([ rhythmbox ]);
}

export async function discoverAndApplyPlugins(engine: Engine): Promise<any> {
  const plugins = await discoverPlugins();
  console.log('discovered plugins:', plugins.map(p => p.id).join(', '));

  plugins.forEach(plugin => {
    console.log('registering plugin:', plugin.id);
    plugin.applyTo(engine);
  });
}
