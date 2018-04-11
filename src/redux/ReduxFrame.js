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
  stateToSerialize.requestStatuses = _.omitBy(
    stateToSerialize.requestStatuses, 
    val => [REQUEST_STATUS.PENDING, REQUEST_STATUS.FAILED].includes(val)
  );
  window.localStorage.setItem(localStorageKey, JSON.stringify(stateToSerialize));
});

const ReduxFrame = ({children}) => <Provider store={store}>{children}</Provider>;

export default ReduxFrame;
