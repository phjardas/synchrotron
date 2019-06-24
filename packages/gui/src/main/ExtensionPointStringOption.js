import { TextField } from '@material-ui/core';
import React from 'react';

export default function ExtensionPointStringOption({ option, values, handleChange, handleBlur }) {
  return (
    <TextField
      name={option.id}
      value={values[option.id] || ''}
      label={option.label}
      helperText={option.description.replace(/`/g, '')}
      onChange={handleChange}
      onBlur={handleBlur}
      fullWidth
      required={option.required}
      margin="normal"
    />
  );
}
