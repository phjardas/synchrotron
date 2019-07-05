import { Card, CardContent, makeStyles, Typography } from '@material-ui/core';
import { Add as AddIcon, Block as FailedIcon, Clear as DeleteIcon, Remove as UnchangedIcon } from '@material-ui/icons';
import bytes from 'bytes';
import React from 'react';

const useStyles = makeStyles(({ spacing }) => ({
  cards: {
    margin: `${spacing(2)}px ${spacing(2)}px 0`,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridGap: spacing(2),
  },
}));

export default function SynchronizationSuccess({ result }) {
  const { bytesTransferred, timeMillis } = result;
  const files = {
    created: result.filesCreated,
    deleted: result.filesDeleted,
    failed: result.filesFailed,
    unchanged: result.filesUnchanged,
  };
  const playlists = {
    created: result.playlistsCreated,
    deleted: result.playlistsDeleted,
    failed: result.playlistsFailed,
    unchanged: result.playlistsUnchanged,
  };
  const classes = useStyles();

  return (
    <div className={classes.cards}>
      <Statistics title="Files" stats={files} />
      <Statistics title="Playlists" stats={playlists} />
      <Card>
        <CardContent>
          <Typography variant="h6" component="h3">
            Statistics
          </Typography>
          <Typography gutterBottom>{bytes.format(bytesTransferred, { unitSeparator: ' ' })} transferred</Typography>
          <Typography>Duration: {timeMillis} ms</Typography>
        </CardContent>
      </Card>
    </div>
  );
}

function Statistics({ title, stats, ...props }) {
  const icons = { created: AddIcon, deleted: DeleteIcon, failed: FailedIcon, unchanged: UnchangedIcon };

  return (
    <Card {...props}>
      <CardContent>
        <Typography variant="h6" component="h3">
          {title}
        </Typography>
        {['created', 'deleted', 'failed', 'unchanged']
          .filter(type => stats[type])
          .map(type => {
            const Icon = icons[type];
            return (
              <Typography key={type} style={{ display: 'flex', alignContent: 'baseline' }}>
                <Icon />
                {stats[type]} {type}
              </Typography>
            );
          })}
      </CardContent>
    </Card>
  );
}
