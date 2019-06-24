import { Button, Card, CardContent, makeStyles, Typography } from '@material-ui/core';
import {
  Add as AddIcon,
  Block as FailedIcon,
  Clear as DeleteIcon,
  MusicNote as FileIcon,
  QueueMusic as PlaylistIcon,
  Remove as UnchangedIcon,
} from '@material-ui/icons';
import bytes from 'bytes';
import React from 'react';

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    margin: spacing(3),
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridGap: spacing(2),
  },
  card: {
    flex: 1,
  },
}));

export default function SynchronizationResult({ result, onReset }) {
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
    <div className={classes.root}>
      <Typography variant="h5" component="h2">
        Done!
      </Typography>
      <div className={classes.cards}>
        <Statistics title="Files" icon={FileIcon} stats={files} className={classes.card} />
        <Statistics title="Playlists" icon={PlaylistIcon} stats={playlists} className={classes.card} />
      </div>
      <p>{bytes.format(bytesTransferred, { unitSeparator: ' ' })} transferred</p>
      <p>Duration: {timeMillis} ms</p>
      <Button variant="contained" color="primary" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}

function Statistics({ title, icon, stats, ...props }) {
  const Icon = icon;
  const icons = { created: AddIcon, deleted: DeleteIcon, failed: FailedIcon, unchanged: UnchangedIcon };

  return (
    <Card {...props}>
      <CardContent>
        <Typography variant="h6" component="h3" style={{ display: 'flex', alignContent: 'baseline' }}>
          <Icon />
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
