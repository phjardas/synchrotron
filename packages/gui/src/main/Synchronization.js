import React, { useEffect, useState } from 'react';
import { synchronize } from '../utils/electron';

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

export default function Synchronization({ options, onComplete }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    synchronize(options)
      .on('log', (level, message, ...args) => {
        if (message.trim().length) {
          console[level](message, ...args);
          setLogs(prev => [...prev, { level, message, args }]);
        }
      })
      .on('done', result => {
        console.info('done:', result);
        onComplete({ result });
      })
      .on('error', error => {
        console.error('error:', error);
        onComplete({ error });
      });
  }, [options, onComplete, setLogs]);

  return (
    <div>
      <h2>synchronizing</h2>
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
