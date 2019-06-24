import { Button, FormHelperText, FormLabel, makeStyles } from '@material-ui/core';
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

export default function ExtensionPointDirectoryOption({ option, values, handleChange }) {
  const classes = useStyles();

  const onSelect = useCallback(async () => {
    const selection = await openSelectDialog();
    console.log('selection:', selection);
    handleChange({ name: option.id, value: selection.length ? selection[0] : '' });
  }, [handleChange, option.id]);

  return (
    <div className={classes.root}>
      <FormLabel required={option.required} className={classes.label}>
        {option.label}
      </FormLabel>
      <div className={classes.control}>
        <div className={classes.value}>{values[option.id] ? values[option.id] : <em>none</em>}</div>
        <Button type="button" onClick={onSelect}>
          select
        </Button>
      </div>
      <FormHelperText>{option.description.replace(/`/g, '')}</FormHelperText>
    </div>
  );
}
