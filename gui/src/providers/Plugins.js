import React, { useEffect, useState } from 'react';
const { ipcRenderer } = window.require('electron');

const Context = React.createContext();

export function PluginsProvider({ children }) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    ipcRenderer.on('get-plugins-reply', (_, { plugins, error }) => setState({ plugins, error, loading: false }));
    ipcRenderer.send('get-plugins');
  }, []);

  return <Context.Provider value={state}>{children}</Context.Provider>;
}

export function withPlugins(Component) {
  return props => <Context.Consumer>{context => <Component {...context} {...props} />}</Context.Consumer>;
}
