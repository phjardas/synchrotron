import { makeStyles } from '@material-ui/styles';
import React from 'react';

const useStyles = makeStyles(({ spacing }) => ({
  actions: {
    margin: spacing(2),
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

export default function Actions({ children }) {
  const classes = useStyles();
  return <div className={classes.actions}>{children}</div>;
}
