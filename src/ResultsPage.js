import React from 'react';
import got from 'got';
import update from 'immutability-helper';
import {withRouter} from 'react-router-dom';

const REQUEST_STATUS = {
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  SUCCEEDED: 'SUCCEEDED'
};

// TODO: Consider cancelling requests.

const CommitResultItem = ({commit}) => <p>{commit.messageHeadline}</p>;

const RepoResultItem = ({repo: {name, forks, stargazers, defaultBranchRef}}) => <div>
  <h2>{name}</h2>
  <p>{forks.totalCount} forks; {stargazers.totalCount} stars</p>
  <h3>Commits</h3>
  <ul>
    {
      defaultBranchRef.target.history.nodes.map(
        commit => <li key={commit.id}><CommitResultItem commit={commit} /></li>
      )
    }
  </ul>
</div>;

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
      const response = await got.post('https://api.github.com/graphql', {
        json: true,
        headers: {
          // This GH token does not have any permissions on my account,
          // so it's ok to share publicly by deploying it with a client-side app.
          Authorization: 'bearer be0309a58fd1f4c6dff81e1b63ac1eb8e2f99f8f'
        },
        body: {
          // For simplicity, we'll just do one big request.
          // One could imagine making the UI more responsive by doing a smaller
          // and faster request to just fetch repos, and then fetch commits.
          query: `
            query ($org_name: String!) {
              organization(login: $org_name) {
                repositories(first: 100, orderBy: {direction: DESC, field: STARGAZERS}) {
                  nodes {
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
                              id
                              messageHeadline
                              message
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
            $set: response.body
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

      return <ul>
        {
          response.data.organization.repositories.nodes.map(repo => 
            <li key={repo.name}><RepoResultItem repo={repo} /></li>
          )
        }
      </ul>;
    }

    return <p>Loading: {orgName}</p>;
  }
}

export default withRouter(ResultsPage);
