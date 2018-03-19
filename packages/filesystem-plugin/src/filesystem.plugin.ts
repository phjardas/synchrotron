import { Plugin } from '@synchrotron/plugin-api';

import FilesystemTargetAdapterExtension from './filesystem.extension';

export const plugin: Plugin = {
  id: 'filesystem',
  version: '0.1.0',
  name: 'Filesystem',
  description: 'Writes files directly to the file system',
  author: 'Philipp Jardas <philipp@jardas.de>',
  extensions: [new FilesystemTargetAdapterExtension()],
};
