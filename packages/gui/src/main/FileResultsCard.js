import { Card, CardContent, List, makeStyles, Typography } from '@material-ui/core';
import React, { useMemo } from 'react';
import FileResultsDetails from './FileResultsDetails';

const useStyles = makeStyles({
  title: {
    paddingBottom: 0,
  },
});

export default function FileResultsCard({ title, results, ...props }) {
  const classes = useStyles();
  const typeResults = useMemo(() => results.reduce((s, r) => ({ ...s, [r.type]: [...(s[r.type] || []), r] }), {}), [results]);

  return (
    <Card {...props}>
      <CardContent className={classes.title}>
        <Typography variant="h6" component="h3">
          {title}
        </Typography>
      </CardContent>
      <List dense>
        {Object.keys(typeResults)
          .sort()
          .map(type => (
            <FileResultsDetails key={type} type={type} results={typeResults[type]} />
          ))}
      </List>
    </Card>
  );
}
