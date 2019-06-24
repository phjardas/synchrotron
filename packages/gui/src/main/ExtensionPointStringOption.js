import { TextField } from '@material-ui/core';
import { useField } from 'formik';
import React from 'react';

export default function ExtensionPointStringOption({ option }) {
  const [field] = useField(option.id);

  return (
    <TextField
      {...field}
      label={option.label}
      helperText={option.description.replace(/`/g, '')}
      fullWidth
      required={option.required}
      margin="normal"
    />
  );
}
