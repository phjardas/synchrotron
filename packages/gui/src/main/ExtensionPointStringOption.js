import { TextField } from '@material-ui/core';
import { useField } from 'formik';
import React from 'react';
import { required } from '../utils/validation';

export default function ExtensionPointStringOption({ option }) {
  const [field] = useField({ name: option.id, validate: option.required && required });

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
