import { useState, useEffect } from 'react';

const { ipcRenderer } = window.require('electron');

export function useOpenDialog(options) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    ipcRenderer.on('show-open-dialog-reply', (_, { error, selection }) => {
      console.log('reply:', { error, selection });
    });
    ipcRenderer.send('show-open-dialog', options);
  }, [options, setState]);

  return state;
}
