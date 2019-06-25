import { CssBaseline } from '@material-ui/core';
import { amber, purple } from '@material-ui/core/colors';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import React from 'react';

const theme = createMuiTheme({
  palette: {
    primary: purple,
    secondary: amber,
  },
});

if (process.env.NODE_ENV === 'development') console.debug('Theme:', theme);

export function ThemeProvider({ children }) {
  return (
    <>
      <CssBaseline />
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </>
  );
}
