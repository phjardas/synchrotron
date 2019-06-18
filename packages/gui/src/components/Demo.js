import React from 'react';
import { usePlugins } from '../providers/Plugins';

export default function Demo() {
  const context = usePlugins();
  return (
    <div>
      <pre>{JSON.stringify(context, null, 2)}</pre>
    </div>
  );
}
