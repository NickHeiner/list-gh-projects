import React from 'react';
import {css} from 'glamor';
import FormattedNumber from './FormattedNumber';
import CommitResultItem from './CommitResultItem';
import {COUNT_COMMITS_TO_SHOW} from './lib/Constants';
import HighlightMatches from './HighlightMatches';
import Star from 'material-ui/svg-icons/toggle/star';
import CallSplit from 'material-ui/svg-icons/communication/call-split';
import Paper from 'material-ui/Paper';
import _ from 'lodash';

const RepoResultItem = ({matchedRepo, index}) => {
  const {repo: {name, forks, stargazers, defaultBranchRef, url}, match} = matchedRepo;

  const paperStyles = {
    padding: '5px',
    marginLeft: '5px',
    marginRight: '5px'
  };
  const headerRowStyles = css({
    display: 'flex',
    alignItems: 'baseline'
  });
  const headerStyles = css({
    marginTop: 0,
    marginBottom: 0,
    marginRight: '10px'
  });
  const subtleTextColorStyles = {
    color: '#586069'
  };
  const subtitleStyles = css({
    ...subtleTextColorStyles,
    display: 'flex',
    fontSize: '.9rem'
  });
  const iconSideLength = '1em';
  const iconStyles = {
    ...subtleTextColorStyles,
    width: iconSideLength,
    height: iconSideLength,
    position: 'relative',
    top: '.125em'
  };
  const tableStyles = css({
    width: '100%',
    '& td': {
      padding: '10px',
      margin: 0
    }
  });
  const firstSubtitleEntryStyles = css({
    marginRight: '10px'
  });
  return <Paper style={paperStyles}>
    <div {...headerRowStyles}>
      <h2 {...headerStyles}><a href={url}><HighlightMatches toHighlight={name} matches={match} /></a></h2>
      <p {...subtitleStyles}>
        <div {...firstSubtitleEntryStyles}>
          <span aria-hidden={true}>
            <CallSplit style={iconStyles} />
          </span>
          <span aria-label="forks">
            <FormattedNumber>
              {forks.totalCount}
            </FormattedNumber>
          </span>
        </div>
        <div>
          <span aria-hidden={true}>
            <Star style={iconStyles} />
          </span>
          <span aria-label="stars">
            <FormattedNumber>
              {stargazers.totalCount}
            </FormattedNumber>
          </span>
        </div>
      </p>
    </div>
    {defaultBranchRef 
      ? <table {...tableStyles}>
        <tbody>
          {
            _.take(defaultBranchRef.target.history.nodes, COUNT_COMMITS_TO_SHOW).map(
              (commit, index) => <CommitResultItem key={commit.id} commit={commit} isEvenRow={Boolean(index % 2)} />
            )
          }
        </tbody>
      </table> : <p>There is no default branch to pull commits from. The repo could be empty.</p>
    }
  </Paper>;
};

export default RepoResultItem;
