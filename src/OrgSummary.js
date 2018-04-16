import React from 'react';
import _ from 'lodash';
import FormattedNumber from './FormattedNumber';
import moment from 'moment';
import DiffAdditionsDeletions from './DiffAdditionsDeletions';
import BareList from './BareList';

const sumBy = (obj, iteratee) => _(obj).map(iteratee).sum();
const countTopCommittersToShow = 5;

const OrgSummary = ({org, orgName}) => {
  const oneWeekAgo = moment().subtract(1, 'week');
  const allCommits = _(org.repos)
    .flatMap(repo => repo.defaultBranchRef.target.history.nodes)
    .filter(({author}) => moment(author.date).isAfter(oneWeekAgo))
    .value();

  return <div>
    <h2>{orgName}</h2>
    <h3>All Time</h3>
    <table>
      <tbody>
        <tr>
          <td>Total stars:</td>
          <td><FormattedNumber>{sumBy(org.repos, repo => repo.stargazers.totalCount)}</FormattedNumber></td>
        </tr>
        <tr>
          <td>Total forks:</td>
          <td><FormattedNumber>{sumBy(org.repos, repo => repo.forks.totalCount)}</FormattedNumber></td>
        </tr>
      </tbody>
    </table>
    <h3>In the Past Week</h3>
    <table>
      <tbody>
        <tr>
          <td>Commits:</td>
          <td><FormattedNumber>{allCommits.length}</FormattedNumber></td>
        </tr>
        <tr>
          <td>Unique committers:</td>
          <td><FormattedNumber>{_.uniqBy(allCommits, ({author}) => author.name).length}</FormattedNumber></td>
        </tr>
        <tr>
          <td>Net diff size:</td>
          <td>
            <DiffAdditionsDeletions 
              additions={_.sumBy(allCommits, 'additions')} 
              deletions={_.sumBy(allCommits, 'deletions')} />
          </td>
        </tr>
      </tbody>
    </table>
    <h4>Most Active Contributors</h4>
    <BareList>
      {
        _(allCommits)
          .groupBy(({author}) => author.name)
          .toPairs()
          .sortBy(([name, commits]) => -commits.length)
          .take(countTopCommittersToShow)
          .map(([name, commits]) => <li key={name}>{name} – {commits.length}</li>)
          .value()
      }
    </BareList>
  </div>;
};

export default OrgSummary;
