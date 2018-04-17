import React from 'react';
import _ from 'lodash';
import FormattedNumber from './FormattedNumber';
import moment from 'moment';
import DiffAdditionsDeletions from './DiffAdditionsDeletions';
import Author from './Author';
import {css} from 'glamor';

const sumBy = (obj, iteratee) => _(obj).map(iteratee).sum();
const countTopCommittersToShow = 3;

const TotalStatsRow = ({label, attr, org}) => (
  <tr>
    <td>{label}</td>
    <td><FormattedNumber>{sumBy(org.repos, repo => repo[attr].totalCount)}</FormattedNumber></td>
  </tr>
);

const OrgSummary = ({org}) => {
  const oneWeekAgo = moment().subtract(1, 'week');
  const allCommits = _(org.repos)
    .flatMap(repo => _.get(repo, ['defaultBranchRef', 'target', 'history', 'nodes'], []))
    .filter(({author}) => moment(author.date).isAfter(oneWeekAgo))
    .value();

  const displayFlex = css({
    display: 'flex'
  });

  const rootStyles = css({
    '& h2, h3': {
      marginTop: 0,
      marginBottom: 0
    },
    '& td:first-child': {
      padding: 0,
      paddingRight: '5px'
    }
  });

  const statsWrapperStyles = css({
    justifyContent: 'space-between',
    width: '100%'
  });

  return <div {...displayFlex} {...rootStyles}>
    <div {...displayFlex} {...statsWrapperStyles}>
      <div>
        <h3>All Time Stats</h3>
        <table>
          <tbody>
            <TotalStatsRow org={org} label="Total stars:" attr="stargazers" />
            <TotalStatsRow org={org} label="Total forks:" attr="forks" />
            <TotalStatsRow org={org} label="Total issues:" attr="issues" />
          </tbody>
        </table>
      </div>
      <div>
        <h3>Activity In The Past Week</h3>
        <div {...displayFlex}>
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
        </div>
      </div>
      <div>         
        <h3>Authors With Commits In The Past Week</h3>
        <table>
          <tbody>
            {
              _(allCommits)
                .groupBy(({author}) => author.name)
                .toPairs()
                .sortBy(([name, commits]) => -commits.length)
                .take(countTopCommittersToShow)
                .map(([name, commits]) => {
                  const {author} = _.find(allCommits, ({author}) => author.name === name);
                  return <tr key={name}>
                    <td><Author author={author} /></td><td>{commits.length}</td>
                  </tr>;
                })
                .value()
            }
          </tbody>
        </table>
      </div>
    </div>
  </div>;
};

export default OrgSummary;
