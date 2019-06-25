import React, { useCallback, useState } from 'react';
import Layout from '../components/Layout';
import Form from './Form';
import Synchronization from './Synchronization';
import SynchronizationResult from './SynchronizationResult';

const defaultOptions = {
  'library-adapter': 'playlist',
  'playlist-files': '/media/phjardas/EB9F-D4F7/Hoerspiele.m3u8',
  'target-adapter': 'filesystem',
  'target-dir': '/home/phjardas/Music/tmp',
};

export default function Main() {
  const [{ options, synchronizing, result }, setState] = useState({ options: defaultOptions, synchronizing: false });
  const startSynchronization = useCallback(values => setState({ options: values, synchronizing: true }), [setState]);
  const onComplete = useCallback(({ error, result }) => setState(s => ({ ...s, synchronizing: false, error, result })), [setState]);
  const onReset = useCallback(() => setState(s => ({ ...s, synchronizing: false, result: undefined })), [setState]);

  return (
    <Layout>
      {synchronizing ? (
        <Synchronization options={options} onComplete={onComplete} />
      ) : result ? (
        <SynchronizationResult result={result} onReset={onReset} />
      ) : (
        <Form options={options} onSubmit={startSynchronization} />
      )}
    </Layout>
  );
}
