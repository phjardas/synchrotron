import React from 'react';
import { PluginsProvider } from './providers/Plugins';
import { ThemeProvider } from './providers/Theme';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <PluginsProvider>{children}</PluginsProvider>
    </ThemeProvider>
  );
}
