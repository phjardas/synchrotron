import React, { createContext, useEffect, useState, useContext } from 'react';
import { callMain } from '../utils/electron';

const { ipcRenderer } = window.require('electron');

const Context = createContext();

export function PluginsProvider({ children }) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    callMain('get-plugins')
      .then(({ plugins }) => {
        const extensionPoints = {};
        plugins.forEach(plugin =>
          plugin.extensions.forEach(ext => (extensionPoints[ext.type] = extensionPoints[ext.type] || []).push({ ...ext, plugin }))
        );

        setState({ plugins, extensionPoints, loading: false });
      })
      .catch(error => {
        setState({ loading: false, error });
      });
  }, []);

  return <Context.Provider value={state}>{children}</Context.Provider>;
}

export function usePlugins() {
  return useContext(Context);
}
