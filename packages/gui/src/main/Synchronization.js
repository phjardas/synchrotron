import { makeStyles } from '@material-ui/styles';
import React, { useEffect, useState } from 'react';
import { synchronize } from '../utils/electron';
import Progress from './Progress';

function formatLogMessage(message, args) {
  let i = 0;
  return message.replace(/%[sd]/g, () => args[i++]);
}

function LogEntry({ level, message, args }) {
  return (
    <>
      <strong>{level}</strong> {formatLogMessage(message, args)}
    </>
  );
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    margin: spacing(3),
  },
}));

export default function Synchronization({ options, onComplete }) {
  const classes = useStyles();
  const [progress, setProgress] = useState();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    synchronize(options)
      .on('log', (level, message, ...args) => {
        if (message.trim().length) {
          setLogs(prev => [...prev, { level, message, args }]);
        }
      })
      .on('progress', setProgress)
      .on('done', result => onComplete({ result }))
      .on('error', error => {
        console.error('error:', error);
        onComplete({ error });
      });
  }, [options, onComplete, setLogs]);

  return (
    <div className={classes.root}>
      <h2>Synchronizing&hellip;</h2>
      {progress && <Progress task={progress.context && progress.context.task} completed={progress.completed} total={progress.total} />}
      <ul>
        {logs.map((log, i) => (
          <li key={i}>
            <LogEntry {...log} />
          </li>
        ))}
      </ul>
    </div>
  );
}
