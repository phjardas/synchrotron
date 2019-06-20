import React from 'react';
import ExtensionPointStringOption from './ExtensionPointStringOption';

export default function ExtensionPointOptions({ option, ...props }) {
  switch (option.type) {
    case 'string':
      return <ExtensionPointStringOption option={option} {...props} />;
    default:
      return <div>Option: {option.type}</div>;
  }
}
