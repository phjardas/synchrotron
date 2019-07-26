import { Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useEffect, useReducer } from 'react';
import { synchronize } from '../utils/electron';
import Progress from './Progress';

const useStyles = makeStyles(({ spacing }) => ({
  card: {
    margin: spacing(2),
    '&:last-child': {
      marginTop: 0,
    },
  },
  progress: {
    marginTop: spacing(1),
  },
}));

function reducer(state, action) {
  switch (action.type) {
    case 'task_group_started':
      return { task: action.label, completed: 0, total: action.taskCount };
    case 'task_group_completed':
      return {};
    case 'task_completed':
    case 'task_failed':
      return { ...state, completed: (state.completed || 0) + 1 };
    default:
      return state;
  }
}

export default function Synchronization({ options, onComplete }) {
  const classes = useStyles();
  const [state, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    synchronize(options)
      .on('data', dispatch)
      .on('done', result => onComplete({ result }))
      .on('error', error => onComplete({ error }));
  }, [options, onComplete]);

  return (
    <>
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h5" component="h2">
            Synchronizing…
          </Typography>
          {state.total > 0 && <Progress task={state.task} completed={state.completed} total={state.total} className={classes.progress} />}
        </CardContent>
      </Card>
    </>
  );
}
