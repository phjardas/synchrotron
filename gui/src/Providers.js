import React from 'react';
import { ThemeProvider } from './providers/Theme';

export default function Providers({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
