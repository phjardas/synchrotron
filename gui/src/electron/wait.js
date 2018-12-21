const net = require('net');
const { exec } = require('child_process');

const port = process.env.PORT ? process.env.PORT - 100 : 3000;
const url = `http://localhost:${port}`;

const client = new net.Socket();

let startedElectron = false;

function tryConnection() {
  console.info('Trying to connect on %s', url);
  client.connect(
    { port },
    () => {
      client.end();
      if (!startedElectron) {
        console.info('starting electron on port %s', url);
        startedElectron = true;
        process.env.NODE_ENV = 'development';
        process.env.ELECTRON_START_URL = url;
        exec('npm run electron');
      }
    }
  );
}

tryConnection();

client.on('error', error => {
  setTimeout(tryConnection, 1000);
});
