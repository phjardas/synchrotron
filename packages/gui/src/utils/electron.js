const { ipcRenderer } = window.require('electron');

function randomId() {
  return Math.random()
    .toString(36)
    .substring(2);
}

export function callMain(type, ...args) {
  const id = randomId();

  return new Promise((resolve, reject) => {
    ipcRenderer.on(`${type}-reply-${id}`, (_, error, result) => {
      if (error) {
        console.warn('reply %s [%s]:', type, id, error);
        reject(error);
      }

      console.info('reply %s [%s]:', type, id, result);
      resolve(result);
    });

    console.info('request %s [%s]:', type, id, args);
    ipcRenderer.send(type, id, ...args);
  });
}

export async function showOpenDialog(options) {
  const { selection } = await callMain('show-open-dialog', options);
  return selection;
}
