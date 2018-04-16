import React from 'react';
import {css} from 'glamor';
import FormattedNumber from './FormattedNumber';
import CommitResultItem from './CommitResultItem';
import {REPO_ROW_HEIGHT} from './Constants';
import HighlightMatches from './HighlightMatches';

const RepoResultItem = ({matchedRepo, index}) => {
  const {repo: {name, forks, stargazers, defaultBranchRef, url}, match} = matchedRepo;

  const rootStyles = css({
    border: '1px rgb(234, 236, 239) solid',
    marginBottom: '10px',
    padding: '5px',
    '& a': {
      color: '#0366d6',
      textDecoration: 'none',
      ':hover': {
        textDecoration: 'underline'
      }
    },
    minHeight: `${REPO_ROW_HEIGHT}px`
  });
  const headerRowStyles = css({
    display: 'flex',
    alignItems: 'baseline'
  });
  const headerStyles = css({
    marginTop: 0,
    marginRight: '10px'
  });
  const subtitleStyles = css({
    color: '#586069',
    fontSize: '.85rem'
  });
  const commitsHeaderStyles = css({
    marginTop: 0,
    marginBottom: 0
  });
  const tableStyles = css({
    width: '100%',
    '& td': {
      padding: '10px',
      margin: 0
    }
  });
  return <div {...rootStyles}>
    <div {...headerRowStyles}>
      <h2 {...headerStyles}><a href={url}><HighlightMatches toHighlight={name} matches={match} /></a></h2>
      <p {...subtitleStyles}>
        (<FormattedNumber>
          {forks.totalCount}
        </FormattedNumber> forks;{' '} 
        <FormattedNumber>
          {stargazers.totalCount}
        </FormattedNumber> stars)
      </p>
    </div>
    <h3 {...commitsHeaderStyles}>Commits</h3>
    {defaultBranchRef 
      ? <table {...tableStyles}>
        <tbody>
          {
            defaultBranchRef.target.history.nodes.map(
              (commit, index) => <CommitResultItem key={commit.id} commit={commit} isEvenRow={Boolean(index % 2)} />
            )
          }
        </tbody>
      </table> : <p>There is no default branch to pull commits from. The repo could be empty.</p>
    }

  </div>;
};

export default RepoResultItem;
