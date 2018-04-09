import React from 'react';
import got from 'got';
import update from 'immutability-helper';

const REQUEST_STATUS = {
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  SUCCEEDED: 'SUCCEEDED'
};

// TODO: Consider cancelling requests.

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
    if (this.state.requestStatuses[orgName]) {
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
            $set: JSON.parse(response.body)
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

    if (this.state.requestStatuses[orgName] === REQUEST_STATUS.FAILED) {
      return <p>Request for {orgName} failed</p>;
    }

    if (this.state.responseCache[orgName]) {
      return <p>Loaded for {orgName}</p>;
    }

    return <p>Loading: {orgName}</p>;
  }
}

export default ResultsPage;
