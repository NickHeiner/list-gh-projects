import React from 'react';
import axios from 'axios';
import update from 'immutability-helper';
import {withRouter} from 'react-router-dom';
import {css} from 'glamor';
import {SMALL_SIZE_MEDIA_QUERY} from './Constants';
import NumberFormat from 'react-number-format';

const FormattedNumber = ({val}) => <NumberFormat value={val} displayType="text" thousandSeparator />;

const REQUEST_STATUS = {
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  SUCCEEDED: 'SUCCEEDED'
};

// TODO: Consider cancelling requests.

const BareList = ({children}) => {
  const styles = css({
    paddingLeft: 0,
    listStyle: 'none'
  });
  return <ul {...styles}>{children}</ul>;
};

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
  const hideForSmallScreens = css({
    [SMALL_SIZE_MEDIA_QUERY]: {
      display: 'none'
    }
  });
  return <React.Fragment>
    <td>
      <a href={commit.url}>{commit.abbreviatedOid}</a>&nbsp;
    </td>
    <td {...hideForSmallScreens}>
      (<ColoredText color="#28a745">+<FormattedNumber val={commit.additions} /></ColoredText>
      /<ColoredText color="#cb2431">-<FormattedNumber val={commit.deletions} /></ColoredText>)&nbsp;
    </td>
    <td>
      {commit.messageHeadline}
    </td>
    <td {...imageCellStyles} {...hideForSmallScreens}>
      <img src={commit.author.avatarUrl} alt="" {...imageStyles} />
      {commit.author.user ? 
        <a href={commit.author.user.url}>{commit.author.name}</a> :
        commit.author.name
      }
    </td>
  </React.Fragment>;
};

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

class ResultsPage extends React.PureComponent {
  
  constructor() {
    super();

    // TODO explain rationale
    this.state = {
      responseCache: {},
      requestStatuses: {}
    };
  }

  componentDidMount() {
    this.fetchDataForOrgName();
  }
  
  componentDidUpdate() {
    this.fetchDataForOrgName();
  }

  async fetchDataForOrgName() {
    const {orgName} = this.props.match.params;
    if (this.state.requestStatuses[orgName] || !orgName) {
      return;
    }

    this.setState(update(this.state, {
      requestStatuses: {
        [orgName]: {
          $set: REQUEST_STATUS.PENDING
        }
      }
    }));

    try {
      const response = await axios.post('https://api.github.com/graphql', {
        // For simplicity, we'll just do one big request.
        // One could imagine making the UI more responsive by doing a smaller
        // and faster request to just fetch repos, and then fetch commits.
        query: `
          query ($org_name: String!) {
            organization(login: $org_name) {
              repositories(first: 2, orderBy: {direction: DESC, field: STARGAZERS}) {
                nodes {
                  url
                  name
                  forks {
                    totalCount
                  }
                  stargazers {
                    totalCount
                  }
                  defaultBranchRef {
                    target {
                      ... on Commit {
                        history(first: 5) {
                          nodes {
                            url
                            abbreviatedOid
                            id
                            deletions
                            additions
                            messageHeadline
                            author {
                              avatarUrl
                              date
                              name
                              user {
                                url
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          // eslint-disable-next-line camelcase
          org_name: orgName
        }
      }, {
        headers: {
          // This GH token does not have any permissions on my account,
          // so it's ok to share publicly by deploying it with a client-side app.
          Authorization: 'bearer be0309a58fd1f4c6dff81e1b63ac1eb8e2f99f8f'
        }
      });
      
      this.setState(update(this.state, {
        requestStatuses: {
          [orgName]: {
            $set: REQUEST_STATUS.SUCCEEDED
          }
        },
        responseCache: {
          [orgName]: {
            $set: response.data
          }  
        }
      }));
    } catch (err) {
      this.setState(update(this.state, {
        requestStatuses: {
          [orgName]: {
            $set: REQUEST_STATUS.FAILED
          }
        }
      }));
    }
  }
    
  render() {
    const {orgName} = this.props.match.params;

    if (!orgName) {
      return null;
    }

    if (this.state.requestStatuses[orgName] === REQUEST_STATUS.FAILED) {
      return <p>Request for {orgName} failed</p>;
    }

    const response = this.state.responseCache[orgName];
    if (response) {
      if (!response.data.organization) {
        // It could be that the organization is not publicly visible,
        // in which case GH would not even confirm its existence. In that case, 
        // we would want to make this error message a bit more precise. Can
        // organizations be hidden from the public? I'm not sure, but it doesn't
        // seem like a great use of time to find out. :)
        return <p>Organization {orgName} does not exist.</p>;
      }

      return <BareList>
        {
          response.data.organization.repositories.nodes.map(repo => 
            <li key={repo.name}><RepoResultItem repo={repo} /></li>
          )
        }
      </BareList>;
    }

    return <p>Loading: {orgName}</p>;
  }
}

export default withRouter(ResultsPage);
