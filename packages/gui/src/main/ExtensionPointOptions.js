import React from 'react';
import ExtensionPointOption from './ExtensionPointOption';

export default function ExtensionPointOptions({ extensionPoint, ...props }) {
  return (
    <>
      {(extensionPoint.options || []).map(option => (
        <ExtensionPointOption key={option.id} option={option} {...props} />
      ))}
    </>
  );
}
