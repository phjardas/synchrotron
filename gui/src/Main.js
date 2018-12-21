import React from 'react';
import { PluginManager } from 'synchrotron';
import Layout from './components/Layout';

const pluginManager = new PluginManager();
console.log('pluginManager:', pluginManager);
pluginManager.plugins.then(plugins => console.log('plugins:', plugins)).catch(error => console.error('Error getting plugins:', error));

export default function Main() {
  return (
    <Layout>
      <p>Welcome!</p>
    </Layout>
  );
}
