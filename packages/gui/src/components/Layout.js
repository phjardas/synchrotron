import { makeStyles } from '@material-ui/styles';
import React from 'react';

const useStyles = makeStyles(() => ({
  main: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    flex: 1,
  },
}));

export default function Layout({ children }) {
  const classes = useStyles();

  return <main className={classes.main}>{children}</main>;
}
