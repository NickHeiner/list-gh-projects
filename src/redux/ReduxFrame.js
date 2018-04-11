import React from 'react';
import {createStore, applyMiddleware, compose} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducer';
import thunk from 'redux-thunk';
import _ from 'lodash';
import { REQUEST_STATUS } from '../Constants';

const initialState = {
  requestStatuses: {
    // This object is a mapping from orgName to RequestStatus.
    // The value indicates what the status of all requests for that 
    // org name is. If we wanted to make this more robust, we'd have
    // a finer-grained mechanism to retry individual requests.
  },
  responses: {},
  repoFilter: ''
};
const localStorageKey = 'githubResponseCache';

const getJsonFromLocalStorage = key => {
  try {
    return {
      ...initialState,
      ...JSON.parse(window.localStorage.getItem(key))
    };
  } catch (e) {
    if (e.name !== 'SyntaxError') {
      throw e;
    }

    // If the cache is corrupted in some way, and JSON.parse fails,
    // just return an empty object. When we write to the cache later,
    // we will overwrite the corrupted data.
    return initialState;
  }
};

const loadedState = getJsonFromLocalStorage(localStorageKey);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer, 
  loadedState,
  composeEnhancers(applyMiddleware(thunk))
);

store.subscribe(() => {
  const stateToSerialize = _.omit(store.getState(), 'repoFilter');

  // If we want to automatically retry failed requests, we shouldn't save that status to local storage.
  // Also, if we saved PENDING statuses to local storage, and user refreshed the page while a request
  // was pending, then the app would be stuck in a broken state because it would not launch a new request
  // when one is already pending.
  //
  // This behavior also means that if the user hits refresh in the middle of a load, the UI will start 
  // from the beginning, even though we've already loaded the first results. This is necessary, because 
  // the GH API does not let us paginate directly to an index; we need to traverse through the pages
  // to get the right cursor. The UI will be slightly odd in this case; if the user refreshed at 70/139
  // repos loaded, then the loading indicator will appear to be "stuck" at 70 until the client finishes
  // re-fetching the first 70. Then, the client will continue to fetch the rest, and the loading indicator
  // will look normal again.
  stateToSerialize.requestStatuses = _.omitBy(
    stateToSerialize.requestStatuses, 
    val => [REQUEST_STATUS.PENDING, REQUEST_STATUS.FAILED].includes(val)
  );
  window.localStorage.setItem(localStorageKey, JSON.stringify(stateToSerialize));
});

const ReduxFrame = ({children}) => <Provider store={store}>{children}</Provider>;

export default ReduxFrame;
