import React, { useCallback, useState } from 'react';
import Layout from '../components/Layout';
import { createStorage } from '../utils/storage';
import Form from './Form';
import Synchronization from './Synchronization';
import SynchronizationResult from './SynchronizationResult';

const optionsStorage = createStorage('synchrotron:settings');

const defaultOptions = optionsStorage.get({});

export default function Main() {
  const [{ options, synchronizing, result, error }, setState] = useState({ options: defaultOptions, synchronizing: false });

  const startSynchronization = useCallback(
    values => {
      optionsStorage.set(values);
      setState({
        options: values,
        synchronizing: true,
      });
    },
    [setState]
  );

  const onComplete = useCallback(
    ({ error, result }) =>
      setState(s => ({
        ...s,
        synchronizing: false,
        error,
        result,
      })),
    [setState]
  );

  const onReset = useCallback(
    () =>
      setState(s => ({
        options: defaultOptions,
        synchronizing: false,
        error: undefined,
        result: undefined,
      })),
    [setState]
  );

  return (
    <Layout>
      <Content
        synchronizing={synchronizing}
        result={result}
        error={error}
        options={options}
        onComplete={onComplete}
        onReset={onReset}
        startSynchronization={startSynchronization}
      />
    </Layout>
  );
}

function Content({ synchronizing, result, error, options, onComplete, onReset, startSynchronization }) {
  if (synchronizing) return <Synchronization options={options} onComplete={onComplete} />;
  if (result || error) return <SynchronizationResult result={result} error={error} onReset={onReset} />;
  return <Form options={options} onSubmit={startSynchronization} />;
}
