import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { useField, useFormikContext } from 'formik';
import React, { useMemo } from 'react';
import { usePlugins } from '../providers/Plugins';
import ExtensionPointOptions from './ExtensionPointOptions';

export default function PluginSelect({ type, label = 'Type' }) {
  const { extensionPoints } = usePlugins();
  const { values } = useFormikContext();
  const [field] = useField(type);

  const value = useMemo(() => values[type], [values, type]);
  const extensionsPoint = useMemo(() => extensionPoints[type].find(e => e.id === value), [extensionPoints, type, value]);

  return (
    <>
      <FormControl fullWidth margin="normal">
        <InputLabel>{label}</InputLabel>
        <Select {...field}>
          {(extensionPoints[type] || [])
            .sort((a, b) => a.plugin.name.localeCompare(b.plugin.name))
            .map(ext => (
              <MenuItem key={ext.id} value={ext.id}>
                {ext.plugin.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      {value && <ExtensionPointOptions extensionPoint={extensionsPoint} />}
    </>
  );
}
