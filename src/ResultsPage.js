import React from 'react';
import got from 'got';
import update from 'immutability-helper';

const REQUEST_STATUS = {
  PENDING: 'PENDING',
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

    const response = await got.post('https://api.github.com/graphql', {
      body: `
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

        variables {
          "org_name": ${orgName}
        }
      `
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
  }

  render() {
    const {orgName} = this.props.match.params;
    if (this.state.responseCache[orgName]) {
      return <p>Loaded for {orgName}</p>;
    }

    return <p>Loading: {orgName}</p>;
  }
}

export default ResultsPage;
