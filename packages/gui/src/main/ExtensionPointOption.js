import React from 'react';
import ExtensionPointDirectoryOption from './ExtensionPointDirectoryOption';
import ExtensionPointFilesOption from './ExtensionPointFilesOption';
import ExtensionPointStringOption from './ExtensionPointStringOption';

export default function ExtensionPointOptions({ option, ...props }) {
  switch (option.type) {
    case 'string':
      return <ExtensionPointStringOption option={option} {...props} />;
    case 'directory':
      return <ExtensionPointDirectoryOption option={option} {...props} />;
    case 'files':
      return <ExtensionPointFilesOption option={option} {...props} />;
    default:
      return <div>Option: {option.type}</div>;
  }
}
