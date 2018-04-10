import {REQUEST_STATUS} from '../Constants';
import moment from 'moment';
import track from '../Track';
import makeGithubApiRequest from '../Api';
import _ from 'lodash';

export const names = {
  START_REQUEST_GROUP: 'START_REQUEST_GROUP',
  FINISH_REQUEST_GROUP: 'FINISH_REQUEST_GROUP',
  UPDATE_ORG_REPOS: 'UPDATE_ORG_REPOS'
};

/**
 * The API results won't change too often, so this should be a safe cache time.
 */
const cacheLifetimeMs = moment.duration(1, 'hour').asMilliseconds();

// eslint-disable-next-line space-before-function-paren
export const startRequestGroup = orgName => async (dispatch, getState) => {
  const state = getState();
  const trackDataLoad = eventAction => track('data-load', eventAction, orgName);

  if (state.requestStatuses[orgName] === REQUEST_STATUS.PENDING) {
    return;
  }
  
  if (state.requestStatuses[orgName] === REQUEST_STATUS.SUCCEEDED) {
    const cachedEntry = this.state.responseCache[orgName];
    if (cachedEntry) {
      if (Date.now() - cachedEntry.savedAtMs < cacheLifetimeMs) {
        trackDataLoad('cache-hit');
        return;
      }
      trackDataLoad('cache-stale');
    }
  }

  dispatch({
    type: names.START_REQUEST_GROUP,
    payload: {
      orgName
    }
  });

  let hasNextPage = true;
  let cursor = null;
  while (hasNextPage) {
    let response;
    try {
      trackDataLoad('make-request');
      response = await makeGithubApiRequest(orgName, cursor);
    } catch (e) {
      trackDataLoad('request-failed');
      dispatch({
        type: names.FINISH_REQUEST_GROUP,
        payload: {
          status: REQUEST_STATUS.FAILED
        }
      });
    }

    const repos = _.get(response.data.data.organization, ['repositories', 'nodes'], null);

    dispatch({
      type: names.UPDATE_ORG_REPOS,
      payload: {
        repos
      }
    });

    hasNextPage = _.get(response.data.data.organization, ['repositories', 'pageInfo', 'hasNextPage']);
    cursor = _.get(response.data.data.organization, ['repositories', 'pageInfo', 'endCursor']);
  }

  trackDataLoad('finish-request-group-success');
  dispatch({
    type: names.FINISH_REQUEST_GROUP,
    payload: {
      status: REQUEST_STATUS.SUCCEEDED
    }
  });
};
