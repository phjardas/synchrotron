import { AppBar, Toolbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';

const useStyles = makeStyles(({ typography }) => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  toolbar: {
    flex: 1,
  },
  title: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    ...typography.h6,
    color: 'inherit',
  },
  main: {
    flex: 1,
  },
}));

export default function Layout({ children }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="sticky" color="primary">
        <Toolbar className={classes.toolbar}>
          <span className={classes.title}>Synchrotron</span>
        </Toolbar>
      </AppBar>

      <main className={classes.main}>{children}</main>
    </div>
  );
}
