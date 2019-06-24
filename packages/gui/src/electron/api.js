const { dialog, ipcMain } = require('electron');
const { PluginManager } = require('synchrotron-core');

const pluginManager = new PluginManager();

const methods = {
  'get-plugins': async () => {
    const plugins = await pluginManager.plugins;
    return { plugins };
  },
  'show-open-dialog': async (_, args) => {
    const options = args;
    const selection = dialog.showOpenDialog(options);
    return { selection };
  },
};

Object.keys(methods).forEach(type => {
  const handler = methods[type];
  const reply = `${type}-reply`;

  ipcMain.on(type, async (event, ...args) => {
    try {
      const result = await handler(event, ...args);
      event.sender.send(reply, result);
    } catch (error) {
      event.sender.send(reply, { error });
    }
  });
});
