const { ipcRenderer } = window.require('electron');

function randomId() {
  return Math.random()
    .toString(36)
    .substring(2);
}

export function callMain(type, ...args) {
  const id = randomId();

  return new Promise((resolve, reject) => {
    ipcRenderer.once(`${type}-reply-${id}`, (_, error, result) => {
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

export function synchronize(options) {
  console.log('submit:', options);
  const id = randomId();
  const listeners = {};
  const emit = (type, ...args) => (listeners[type] || []).forEach(listener => listener(...args));

  const listener = (_, type, ...args) => {
    emit(type, ...args);
    if (type === 'done' || type === 'error') {
      ipcRenderer.removeListener(`synchronize-${id}`, listener);
    }
  };

  ipcRenderer.on(`synchronize-${id}`, listener);
  ipcRenderer.send('synchronize', id, options);

  return {
    on(type, listener) {
      (listeners[type] = listeners[type] || []).push(listener);
      return this;
    },
  };
}

export async function showOpenDialog(options) {
  const { selection } = await callMain('show-open-dialog', options);
  return selection;
}
