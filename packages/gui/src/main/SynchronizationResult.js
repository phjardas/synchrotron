import { Button } from '@material-ui/core';
import React from 'react';
import Actions from './Actions';
import SynchronizationError from './SynchronizationError';
import SynchronizationSuccess from './SynchronizationSuccess';

export default function SynchronizationResult({ error, result, onReset }) {
  return (
    <>
      {error ? <SynchronizationError error={error} /> : <SynchronizationSuccess result={result} />}
      <Actions>
        <Button variant="contained" color="primary" onClick={onReset}>
          Reset
        </Button>
      </Actions>
    </>
  );
}
