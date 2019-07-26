const { ipcMain } = require('electron');
const { PluginManager, Synchrotron } = require('synchrotron-core');

ipcMain.on('synchronize', async (event, id, options) => {
  const reply = (...args) => event.reply(`synchronize-${id}`, ...args);

  try {
    const engine = await createEngine(options);
    const execution = engine.execute();
    execution.on('data', event => reply('data', event));
    execution.on('done', result => reply('done', result));
    execution.on('error', error => {
      console.error(error);
      reply('error', { ...error, message: error.message });
    });
  } catch (error) {
    console.error(error);
    reply('error', { ...error, message: error.message });
  }
});

async function createEngine(options) {
  const pluginManager = new PluginManager();

  const extensions = await Promise.all(
    Synchrotron.extensionPoints
      .map(ep => {
        const extensionId = options[ep];
        return extensionId && pluginManager.getExtension(ep, extensionId);
      })
      .filter(e => !!e)
  );

  return extensions.reduce((engine, ex) => ex.extend(engine, options), new Synchrotron(options));
}
