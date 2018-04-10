import React from 'react';
import {css} from 'glamor';
import {SMALL_SIZE_MEDIA_QUERY} from './Constants';
import FormattedNumber from './FormattedNumber';

const ColoredText = ({children, color}) => <span {...css({color})}>{children}</span>;

const CommitResultItem = ({commit}) => {
  const imageSideLength = '20px';
  const imageCellStyles = css({
    display: 'flex',
    alignItems: 'center'
  });
  const imageStyles = css({
    width: imageSideLength,
    height: imageSideLength,
    borderRadius: '2px',
    marginRight: '5px'
  });
  const hideForSmallScreensStyles = css({
    [SMALL_SIZE_MEDIA_QUERY]: {
      display: 'none'
    }
  });
  return <React.Fragment>
    <td>
      <a href={commit.url}>{commit.abbreviatedOid}</a>&nbsp;
    </td>
    <td {...hideForSmallScreensStyles}>
      (<ColoredText color="#28a745">+<FormattedNumber val={commit.additions} /></ColoredText>
      /<ColoredText color="#cb2431">-<FormattedNumber val={commit.deletions} /></ColoredText>)&nbsp;
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
      <img src={commit.author.avatarUrl} alt="" {...imageStyles} />
      {commit.author.user 
        ? <a href={commit.author.user.url}>{commit.author.name}</a>
        : commit.author.name
      }
    </td>
  </React.Fragment>;
};

export default CommitResultItem;
