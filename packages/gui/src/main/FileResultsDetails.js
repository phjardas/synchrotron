import { Collapse, IconButton, List, ListItem, ListItemText, makeStyles } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import bytes from 'bytes';
import React, { useCallback, useState } from 'react';

const useStyles = makeStyles(({ spacing, transitions }) => ({
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: transitions.create('transform', {
      duration: transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  nested: {
    paddingLeft: spacing(4),
  },
}));

export default function FileResultsDetails({ type, results }) {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);
  const handleExpandClick = useCallback(() => setExpanded(x => !x), [setExpanded]);

  return (
    <>
      <ListItem>
        <ListItemText primary={`${type}: ${results.length}`} />
        <IconButton className={`${classes.expand} ${expanded ? classes.expandOpen : ''}`} onClick={handleExpandClick}>
          <ExpandMore />
        </IconButton>
      </ListItem>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List dense disablePadding>
          {results
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(res => (
              <ListItem key={res.name} className={classes.nested}>
                <ListItemText
                  primary={res.name}
                  secondary={res.bytesTransferred && bytes.format(res.bytesTransferred, { unitSeparator: ' ' })}
                />
              </ListItem>
            ))}
        </List>
      </Collapse>
    </>
  );
}
