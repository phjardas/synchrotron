const { dialog, ipcMain } = require('electron');
const { PluginManager } = require('synchrotron-core');
require('./synchronize');

const pluginManager = new PluginManager();

const methods = {
  'get-plugins': async () => {
    const plugins = await pluginManager.plugins;
    return { plugins };
  },
  'show-open-dialog': async (_, options) => {
    const selection = dialog.showOpenDialog(options);
    return { selection };
  },
};

Object.keys(methods).forEach(type => {
  const handler = methods[type];

  ipcMain.on(type, async (event, id, ...args) => {
    const reply = `${type}-reply-${id}`;

    try {
      const result = await handler(event, ...args);
      event.reply(reply, null, result);
    } catch (error) {
      event.reply(reply, error);
    }
  });
});
