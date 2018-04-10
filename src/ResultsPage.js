import React from 'react';
import axios from 'axios';
import update from 'immutability-helper';
import {withRouter} from 'react-router-dom';
import {css} from 'glamor';
import track from './Track';
import moment from 'moment';
import RepoResultItem from './RepoResultItem';

const REQUEST_STATUS = {
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  SUCCEEDED: 'SUCCEEDED'
};

/**
 * The API results won't change too often, so this should be a safe cache time.
 */
const cacheLifetimeMs = moment.duration(1, 'hour').asMilliseconds();

const BareList = ({children}) => {
  const styles = css({
    paddingLeft: 0,
    listStyle: 'none'
  });
  return <ul {...styles}>{children}</ul>;
};

const localStorageKey = 'githubResponseCache';
const getJsonFromLocalStorage = key => {
  try {
    return JSON.parse(window.localStorage.getItem(key)) || {};
  } catch (e) {
    if (e.name !== 'SyntaxError') {
      throw e;
    }

    // If the cache is corrupted in some way, and JSON.parse fails,
    // just return an empty object. When we write to the cache later,
    // we will overwrite the corrupted data.
    return {};
  }
}

class ResultsPage extends React.PureComponent {
  
  constructor() {
    super();

    // TODO explain rationale
    this.state = {
      responseCache: getJsonFromLocalStorage(localStorageKey),
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
    const trackDataLoad = eventAction => track('data-load', eventAction, orgName);
    const cachedEntry = this.state.responseCache[orgName];
    if (cachedEntry) {
      if (Date.now() - cachedEntry.savedAtMs < cacheLifetimeMs) {
        trackDataLoad('cache-hit');
        return;
      }
      trackDataLoad('cache-stale');
    }
    
    /*
      If the request failed previously, we won't try it again. We could build in a retry mechanism,
      but for a simple internal tool like this, it's probably better to just ask the user to refresh.
    */
    if ([REQUEST_STATUS.FAILED, REQUEST_STATUS.PENDING].includes(this.state.requestStatuses[orgName]) || !orgName) {
      return;
    }
    
    trackDataLoad('cache-miss');
    
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
      
      trackDataLoad('request-success');
      
      const nextState = update(this.state, {
        requestStatuses: {
          [orgName]: {
            $set: REQUEST_STATUS.SUCCEEDED
          }
        },
        responseCache: {
          [orgName]: {
            $set: {
              savedAtMs: Date.now(),
              response: response.data
            }
          }  
        }
      });
      
      window.localStorage.setItem(localStorageKey, JSON.stringify(nextState.responseCache));

      this.setState(nextState);
    } catch (err) {
      trackDataLoad('request-fail');
      
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

    const cachedEntry = this.state.responseCache[orgName];
    if (cachedEntry) {
      if (!cachedEntry.response.data.organization) {
        // It could be that the organization is not publicly visible,
        // in which case GH would not even confirm its existence. In that case, 
        // we would want to make this error message a bit more precise. Can
        // organizations be hidden from the public? I'm not sure, but it doesn't
        // seem like a great use of time to find out. :)
        return <p>Organization {orgName} does not exist.</p>;
      }

      return <BareList>
        {
          cachedEntry.response.data.organization.repositories.nodes.map(repo => 
            <li key={repo.name}><RepoResultItem repo={repo} /></li>
          )
        }
      </BareList>;
    }

    return <p>Loading: {orgName}</p>;
  }
}

export default withRouter(ResultsPage);
