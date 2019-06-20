import { TextField } from '@material-ui/core';
import React from 'react';

export default function ExtensionPointStringOption({ option, values, handleChange, handleBlur }) {
  return (
    <TextField
      label={option.id}
      helperText={option.description}
      name={option.id}
      value={values[option.id] || ''}
      onChange={handleChange}
      onBlur={handleBlur}
      fullWidth
      required={option.required}
      margin="normal"
    />
  );
}
