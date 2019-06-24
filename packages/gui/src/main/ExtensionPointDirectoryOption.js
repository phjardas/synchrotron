import { Button, FormHelperText, FormLabel, Input, makeStyles } from '@material-ui/core';
import { useField } from 'formik';
import React, { useCallback } from 'react';

const { ipcRenderer } = window.require('electron');

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    marginTop: spacing(2),
    marginBottom: spacing(1),
  },
  label: {
    fontSize: '0.75rem',
  },
  control: {
    display: 'flex',
    alignItems: 'baseline',
  },
  value: {
    flex: 1,
  },
}));

function openSelectDialog() {
  return new Promise((resolve, reject) => {
    ipcRenderer.on('show-open-dialog-reply', (_, { error, selection }) => {
      if (error) reject(error);
      resolve(selection);
    });
    ipcRenderer.send('show-open-dialog', { title: 'Select directory', properties: ['openDirectory'] });
  });
}

export default function ExtensionPointDirectoryOption({ option }) {
  const [field] = useField(option.id);
  const classes = useStyles();
  const { name, onChange } = field;

  const onSelect = useCallback(async () => {
    const selection = await openSelectDialog();
    const value = selection && selection.length ? selection[0] : '';
    onChange({ target: { name, value } });
  }, [name, onChange]);

  return (
    <div className={classes.root}>
      <FormLabel required={option.required} className={classes.label}>
        {option.label}
      </FormLabel>
      <div className={classes.control}>
        <Input {...field} fullWidth />
        <Button type="button" onClick={onSelect}>
          select
        </Button>
      </div>
      <FormHelperText>{option.description.replace(/`/g, '')}</FormHelperText>
    </div>
  );
}
