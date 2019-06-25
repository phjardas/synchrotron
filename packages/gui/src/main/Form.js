import { Button, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Form, Formik } from 'formik';
import React, { useMemo } from 'react';
import { usePlugins } from '../providers/Plugins';
import PluginSelect from './PluginSelect';

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

function createInitialValues(plugins, options = {}) {
  const values = {
    'library-adapter': '',
    'target-adapter': '',
  };

  plugins.forEach(plugin => plugin.extensions.forEach(ext => ext.options.forEach(opt => (values[opt.id] = opt.defaultValue || ''))));

  return { ...values, ...options };
}

export default function SynchronizeForm({ options, onSubmit }) {
  const { loading, error, plugins } = usePlugins();
  const classes = useStyles();
  const initialValues = useMemo(() => plugins && createInitialValues(plugins, options), [plugins, options]);

  if (loading) return <CircularProgress />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Formik onSubmit={onSubmit} initialValues={initialValues}>
      {({ isValid, isSubmitting, isValidating }) => (
        <Form className={classes.root}>
          <fieldset className={classes.section}>
            <legend>Source</legend>
            <PluginSelect type="library-adapter" />
          </fieldset>
          <fieldset className={classes.section}>
            <legend>Target</legend>
            <PluginSelect type="target-adapter" />
          </fieldset>
          <div className={classes.actions}>
            <Button variant="contained" color="primary" type="submit" disabled={!isValid || isSubmitting || isValidating}>
              Synchronize
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
