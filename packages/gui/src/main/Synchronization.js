import { Card, CardContent, List, ListItem, ListItemText, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useEffect, useState } from 'react';
import { synchronize } from '../utils/electron';
import Progress from './Progress';

function formatLogMessage(message, args) {
  let i = 0;
  const ret = message.replace(/%[sd]/g, () => args[i++]);
  return i >= args.length
    ? ret
    : `${ret} ${args
        .slice(i)
        .map(JSON.stringify)
        .join(', ')}`;
}

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

export default function Synchronization({ options, onComplete }) {
  const classes = useStyles();
  const [progress, setProgress] = useState({ context: { task: 'foobar' }, completed: 12, total: 80 });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const start = Date.now();
    synchronize(options)
      .on('log', (timestamp, level, message, ...args) => {
        console.log('log:', { timestamp, level, message, args });
        if (message.trim().length) {
          setLogs(prev => [...prev, { elapsed: timestamp - start, level, message, args }]);
        }
      })
      .on('progress', setProgress)
      .on('done', result => onComplete({ result }))
      .on('error', error => onComplete({ error }));
  }, [options, onComplete, setLogs]);

  return (
    <>
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h5" component="h2">
            Synchronizing…
          </Typography>
          {progress && (
            <Progress
              task={progress.context && progress.context.task}
              completed={progress.completed}
              total={progress.total}
              className={classes.progress}
            />
          )}
        </CardContent>
      </Card>
      {logs.length > 0 && (
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="h5" component="h2">
              Log
            </Typography>
          </CardContent>
          <List dense>
            {logs.map((log, i) => (
              <ListItem key={i}>
                <ListItemText
                  primary={formatLogMessage(log.message, log.args)}
                  secondary={
                    <>
                      {log.elapsed} ms - {log.level}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Card>
      )}
    </>
  );
}
