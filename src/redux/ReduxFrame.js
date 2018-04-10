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

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer, 
  initialState,
  composeEnhancers(applyMiddleware(thunk))
);

const ReduxFrame = ({children}) => <Provider store={store}>{children}</Provider>;

export default ReduxFrame;
