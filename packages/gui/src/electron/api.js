const { dialog, ipcMain } = require('electron');
const { PluginManager } = require('synchrotron-core');

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

ipcMain.on('show-open-dialog', async event => {
  try {
    console.info('show-open-dialog:', event);
    const selection = dialog.showOpenDialog({ title: 'Select directory', properties: ['openDirectory'] });
    event.sender.send('show-open-dialog-reply', { selection });
  } catch (error) {
    console.error(error);
    event.sender.send('show-open-dialog-reply', { error });
  }
});
