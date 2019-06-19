import { Button, FormControl, InputLabel, MenuItem, Select, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Formik } from 'formik';
import React from 'react';
import { usePlugins } from '../providers/Plugins';

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
  source: {
    type: '',
  },
  target: {
    type: '',
  },
};

export default function Form({ onSubmit }) {
  const { loading, error, extensionPoints } = usePlugins();
  const classes = useStyles();

  if (loading) return <CircularProgress />;
  if (error) return <div>Error: {error.message}</div>;

  console.log(extensionPoints);

  return (
    <Formik onSubmit={onSubmit} initialValues={initialValues}>
      {({ values, handleBlur, handleChange, handleSubmit }) => (
        <form onSubmit={handleSubmit} className={classes.root}>
          <fieldset className={classes.section}>
            <legend>Source</legend>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select name="source.type" value={values.source.type} onChange={handleChange} onBlur={handleBlur}>
                {(extensionPoints['library-adapter'] || [])
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(plugin => (
                    <MenuItem key={plugin.id} value={plugin.id}>
                      {plugin.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </fieldset>
          <fieldset className={classes.section}>
            <legend>Target</legend>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select name="target.type" value={values.target.type} onChange={handleChange} onBlur={handleBlur}>
                {(extensionPoints['target-adapter'] || [])
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(plugin => (
                    <MenuItem key={plugin.id} value={plugin.id}>
                      {plugin.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
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
