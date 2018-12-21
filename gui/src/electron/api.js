const { ipcMain } = require('electron');
const { PluginManager } = require('synchrotron');

const pluginManager = new PluginManager();

ipcMain.on('get-plugins', async event => {
  try {
    const plugins = await pluginManager.plugins;
    console.info('plugins:', plugins);
    event.sender.send('get-plugins-reply', { plugins });
  } catch (error) {
    console.error(error);
    event.sender.send('get-plugins-reply', { error });
  }
});
