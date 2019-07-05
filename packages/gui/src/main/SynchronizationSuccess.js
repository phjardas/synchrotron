import { Card, CardContent, makeStyles, Typography } from '@material-ui/core';
import bytes from 'bytes';
import React, { useMemo } from 'react';
import FileResultsCard from './FileResultsCard';

const useStyles = makeStyles(({ spacing }) => ({
  cards: {
    margin: `${spacing(2)}px ${spacing(2)}px 0`,
    display: 'grid',
    gridTemplateColumns: 'repeat(1, 1fr)',
    gridGap: spacing(2),
  },
}));

export default function SynchronizationSuccess({ result: { files, playlists, timeMillis } }) {
  const bytesTransferred = useMemo(
    () =>
      files
        .map(f => f.bytesTransferred)
        .filter(Boolean)
        .reduce((a, b) => a + b, 0),
    [files]
  );
  const classes = useStyles();

  return (
    <div className={classes.cards}>
      <Card>
        <CardContent>
          <Typography variant="h6" component="h3">
            Statistics
          </Typography>
          <Typography gutterBottom>{bytes.format(bytesTransferred, { unitSeparator: ' ' })} transferred</Typography>
          <Typography>Duration: {timeMillis} ms</Typography>
        </CardContent>
      </Card>
      <FileResultsCard title="Files" results={files} />
      <FileResultsCard title="Playlists" results={playlists} />
    </div>
  );
}
