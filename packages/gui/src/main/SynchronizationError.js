import { Card, CardContent, makeStyles, Typography } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    margin: `${spacing(2)}px ${spacing(2)}px 0`,
  },
}));

export default function SynchronizationError({ error }) {
  const classes = useStyles();
  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Synchronization failed
        </Typography>
        {error.message && <Typography gutterBottom>{error.message}</Typography>}
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </CardContent>
    </Card>
  );
}
