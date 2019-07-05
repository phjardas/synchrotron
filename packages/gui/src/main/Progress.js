import { LinearProgress, Typography } from '@material-ui/core';
import React from 'react';

export default function Progress({ task, completed, total, ...props }) {
  return (
    <div {...props}>
      <LinearProgress variant="determinate" value={(completed / total) * 100} />
      <Typography variant="caption">
        {task && `${task}: `}
        {completed} of {total}
      </Typography>
    </div>
  );
}
