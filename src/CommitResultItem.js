import React from 'react';
import {css} from 'glamor';
import {SMALL_SIZE_MEDIA_QUERY} from './Constants';
import moment from 'moment';
import DiffAdditionsDeletions from './DiffAdditionsDeletions';
import Author from './Author';

const CommitResultItem = ({commit, isEvenRow}) => {
  const rowStyle = css({
    backgroundColor: isEvenRow ? '#eae8e8' : undefined
  });
  const imageCellStyles = css({
    display: 'flex',
    alignItems: 'center'
  });
  const hideForSmallScreensStyles = css({
    [SMALL_SIZE_MEDIA_QUERY]: {
      display: 'none'
    }
  });
  return <tr {...rowStyle}>
    <td>
      <a href={commit.url}>{commit.abbreviatedOid}</a>&nbsp;
    </td>
    <td {...hideForSmallScreensStyles}>
      <DiffAdditionsDeletions additions={commit.additions} deletions={commit.deletions} />
    </td>
    <td>
      {commit.messageHeadline}
    </td>
    <td {...imageCellStyles} {...hideForSmallScreensStyles}>
      {/* These images will still be requested on smaller screens, because 
          they are loaded into the DOM, even though they are hidden. If we 
          wanted to fix this, we could use window.matchMedia. However, that
          gets more complicated, because we need to redo the check every
          time the window resizes. That would have its own performance implications.
          For now, I think this is fine.
      */}
      <Author author={commit.author} />
    </td>
    <td {...hideForSmallScreensStyles}>
      {moment(commit.author.date).fromNow()}
    </td>
  </tr>;
};

export default CommitResultItem;
