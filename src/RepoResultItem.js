import React from 'react';
import {css} from 'glamor';
import FormattedNumber from './FormattedNumber';
import CommitResultItem from './CommitResultItem';

const RepoResultItem = ({repo}) => {
  const {name, forks, stargazers, defaultBranchRef, url} = repo;

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
    }
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
  return <div {...rootStyles}>
    <div {...headerRowStyles}>
      <h2 {...headerStyles}><a href={url}>{name}</a></h2>
      <p {...subtitleStyles}>
        (<FormattedNumber val={forks.totalCount} /> forks; <FormattedNumber val={stargazers.totalCount} /> stars)
      </p>
    </div>
    <h3 {...commitsHeaderStyles}>Commits</h3>
    <table>
      <tbody>
        {
          defaultBranchRef.target.history.nodes.map(
            commit => <tr key={commit.id}><CommitResultItem commit={commit} /></tr>
          )
        }
      </tbody>
    </table>
  </div>;
};

export default RepoResultItem;
