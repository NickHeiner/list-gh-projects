import LinearProgress from 'material-ui/LinearProgress';
import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import {REQUEST_STATUS, STYLES} from './lib/Constants';
import {withRouter} from 'react-router-dom';

const normalizeOrgName = _.toLower;

const ProgressWrapper = props => {
  const style = {
    backgroundColor: STYLES.HEADER_BACKGROUND_COLOR,
    position: 'absolute'
  };

  return <LinearProgress {...props} style={style} />;
};
    
const LoadingIndicator = ({requestStatus, response}) => {
  if (requestStatus === REQUEST_STATUS.FAILED) {
    return null;
  }

  if (!response) { 
    return <ProgressWrapper />;
  }
  
  const currentlyFetchedRepos = _.size(response.repos);
  if (currentlyFetchedRepos < response.totalCount) {
    return <ProgressWrapper mode="determinate" max={response.totalCount} value={currentlyFetchedRepos} />;
  }

  return null;
};

export default withRouter(connect(
  (state, ownProps) => ({
    requestStatus: state.requestStatuses[normalizeOrgName(ownProps.match.params.orgName)],
    response: state.responses[normalizeOrgName(ownProps.match.params.orgName)]
  }),
)(LoadingIndicator));
