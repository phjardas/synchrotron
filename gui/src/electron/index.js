const { app, BrowserWindow } = require('electron');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
  });

  const appUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '/../build/index.html'),
      protocol: 'file:',
      slashes: true,
    });

  mainWindow.loadURL(appUrl);

  // FIXME only in dev mode!
  mainWindow.webContents.openDevTools();
  mainWindow.maximize();
  require('devtron').install();

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  require('./api');
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});
