import { Button, Card, CardContent, CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Form, Formik } from 'formik';
import React, { useMemo } from 'react';
import { usePlugins } from '../providers/Plugins';
import Actions from './Actions';
import PluginSelect from './PluginSelect';

const useStyles = makeStyles(({ spacing }) => ({
  grid: {
    display: 'grid',
    gridGap: spacing(2),
    gridTemplateColumns: 'repeat(2, 1fr)',
    margin: spacing(2),
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
        <Form>
          <div className={classes.grid}>
            <Card>
              <CardContent>
                <Typography variant="h5">Source</Typography>
                <PluginSelect type="library-adapter" />
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h5">Target</Typography>
                <PluginSelect type="target-adapter" />
              </CardContent>
            </Card>
          </div>
          <Actions>
            <Button variant="contained" color="primary" type="submit" disabled={!isValid || isSubmitting || isValidating}>
              Synchronize
            </Button>
          </Actions>
        </Form>
      )}
    </Formik>
  );
}
