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
            return null;
          }

          return {
            totalCount: action.payload.totalCount,
            repos: {
              ..._.get(prevVal, 'repos'),
              ...action.payload.repos
            }
          };
        }
      }
    });
  default:
    return state;
  }
};

export default reducer;
