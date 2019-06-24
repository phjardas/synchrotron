const { ipcMain } = require('electron');
const { PluginManager, Synchrotron } = require('synchrotron-core');

ipcMain.on('synchronize', async (event, id, options) => {
  const reply = (...args) => event.reply(`synchronize-${id}`, ...args);

  try {
    const opts = {
      ...options,
      logger: createLogger(reply),
    };
    const engine = await createEngine(opts);
    const result = await engine.execute();
    reply('done', result);
  } catch (error) {
    console.error(error);
    reply('error', error);
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

function createLogger(reply) {
  const log = level => (...args) => reply('log', level, ...args);
  return {
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
    startProgress(total) {
      // FIXME implement startProgress()
      return null;
    },
  };
}
