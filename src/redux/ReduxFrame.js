import React from 'react';
import {createStore, applyMiddleware, compose} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducer';
import thunk from 'redux-thunk';

const initialState = {
  requestStatuses: {
    // This object is a mapping from orgName to RequestStatus.
    // The value indicates what the status of all requests for that 
    // org name is. If we wanted to make this more robust, we'd have
    // a finer-grained mechanism to retry individual requests.
  },
  responses: {}
};
const localStorageKey = 'githubResponseCache';

const getJsonFromLocalStorage = key => {
  try {
    return JSON.parse(window.localStorage.getItem(key)) || initialState;
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

store.subscribe(() => window.localStorage.setItem(localStorageKey, JSON.stringify(store.getState())));

const ReduxFrame = ({children}) => <Provider store={store}>{children}</Provider>;

export default ReduxFrame;
