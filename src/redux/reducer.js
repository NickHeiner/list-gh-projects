import {names} from './actions';
import update from 'immutability-helper';
import {REQUEST_STATUS} from '../Constants';
import _ from 'lodash';

const reducer = (state, action) => {
  switch (action.type) {
  case names.START_REQUEST_GROUP: 
    return update(state, {
      requestStatuses: {
        [action.payload.orgName]: {
          $set: REQUEST_STATUS.PENDING
        }
      }
    });
  case names.FINISH_REQUEST_GROUP: 
    return update(state, {
      requestStatuses: {
        [action.payload.orgName]: {
          $set: action.payload.status
        }
      }
    });
  case names.UPDATE_ORG_REPOS: 
    return update(state, {
      responses: {
        [action.payload.orgName]: prevVal => {
          if (!action.payload.repos) {
            return _.pick(action.payload, 'savedAtUTC');
          }

          return {
            ..._.pick(action.payload, 'totalCount', 'savedAtUTC'),
            repos: {
              ..._.get(prevVal, 'repos'),
              ...action.payload.repos
            }
          };
        }
      }
    });
  case names.SET_REPO_FILTER:
    return update(state, {
      repoFilter: {
        $set: action.payload.repoFilter
      }
    });
  default:
    return state;
  }
};

export default reducer;
