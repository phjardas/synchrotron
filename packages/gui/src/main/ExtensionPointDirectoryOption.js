import { Button, FormHelperText, FormLabel, Input, makeStyles } from '@material-ui/core';
import { useField } from 'formik';
import React, { useCallback } from 'react';
import { openSelectDialog } from '../utils/electron';

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

export default function ExtensionPointDirectoryOption({ option }) {
  const [field] = useField(option.id);
  const classes = useStyles();
  const { name, onChange } = field;

  const onSelect = useCallback(async () => {
    const selection = await openSelectDialog({ title: 'Select directory', properties: ['openDirectory'] });
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
