import { LinearProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';

const useStyles = makeStyles(() => ({
  root: {},
  task: {},
  label: {},
  progress: {},
}));

export default function Progress({ task, completed, total }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {task && (
        <Typography variant="caption" className={classes.task}>
          {task}
        </Typography>
      )}
      <Typography variant="body1" className={classes.label}>
        {completed} of {total}
      </Typography>
      <LinearProgress variant="determinate" value={(completed / total) * 100} className={classes.progress} />
    </div>
  );
}
