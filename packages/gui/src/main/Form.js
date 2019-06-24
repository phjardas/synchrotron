import { Button, CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Formik } from 'formik';
import React from 'react';
import { usePlugins } from '../providers/Plugins';
import ExtensionPointOptions from './ExtensionPointOptions';

const useStyles = makeStyles(({ spacing, typography }) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  section: {
    width: '50%',
    margin: 0,
    padding: spacing(3),
    border: 'none',
    '& legend': {
      ...typography.h5,
      paddingTop: spacing(3),
    },
  },
  actions: {
    width: '100%',
    padding: spacing(3),
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

const initialValues = {
  'library-adapter': 'rhythmbox',
  'target-adapter': 'filesystem',
};

export default function Form({ onSubmit }) {
  const { loading, error, extensionPoints } = usePlugins();
  const classes = useStyles();

  if (loading) return <CircularProgress />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Formik onSubmit={onSubmit} initialValues={initialValues}>
      {({ values, handleBlur, handleChange, handleSubmit }) => (
        <form onSubmit={handleSubmit} className={classes.root}>
          <fieldset className={classes.section}>
            <legend>Source</legend>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select name="library-adapter" value={values['library-adapter']} onChange={handleChange} onBlur={handleBlur}>
                {(extensionPoints['library-adapter'] || [])
                  .sort((a, b) => a.plugin.name.localeCompare(b.plugin.name))
                  .map(ext => (
                    <MenuItem key={ext.id} value={ext.id}>
                      {ext.plugin.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            {values['library-adapter'] && (
              <ExtensionPointOptions
                extensionPoint={extensionPoints['library-adapter'].find(e => e.id === values['library-adapter'])}
                values={values}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />
            )}
          </fieldset>
          <fieldset className={classes.section}>
            <legend>Target</legend>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select name="target-adapter" value={values['target-adapter']} onChange={handleChange} onBlur={handleBlur}>
                {(extensionPoints['target-adapter'] || [])
                  .sort((a, b) => a.plugin.name.localeCompare(b.plugin.name))
                  .map(ext => (
                    <MenuItem key={ext.id} value={ext.id}>
                      {ext.plugin.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            {values['target-adapter'] && (
              <ExtensionPointOptions
                extensionPoint={extensionPoints['target-adapter'].find(e => e.id === values['target-adapter'])}
                values={values}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />
            )}
          </fieldset>
          <div className={classes.actions}>
            <Button variant="contained" color="primary" type="submit">
              Synchronize
            </Button>
          </div>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </form>
      )}
    </Formik>
  );
}
