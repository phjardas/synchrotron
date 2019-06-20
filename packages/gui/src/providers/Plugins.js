import React, { createContext, useEffect, useState, useContext } from 'react';

const { ipcRenderer } = window.require('electron');

const Context = createContext();

export function PluginsProvider({ children }) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    ipcRenderer.on('get-plugins-reply', (_, { plugins, error }) => {
      const extensionPoints = {};
      plugins.forEach(plugin =>
        plugin.extensions.forEach(ext => (extensionPoints[ext.type] = extensionPoints[ext.type] || []).push({ ...ext, plugin }))
      );

      setState({ plugins, extensionPoints, error, loading: false });
    });

    ipcRenderer.send('get-plugins');
  }, []);

  return <Context.Provider value={state}>{children}</Context.Provider>;
}

export function usePlugins() {
  return useContext(Context);
}
