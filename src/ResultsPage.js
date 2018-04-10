import React from 'react';
import update from 'immutability-helper';
import {withRouter} from 'react-router-dom';
import {css} from 'glamor';
import track from './Track';
import RepoResultItem from './RepoResultItem';
import {REQUEST_STATUS} from './Constants';
import {connect} from 'react-redux';
import {startRequestGroup} from './redux/actions';
import {bindActionCreators} from 'redux';

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
};

class UnconnectedResultsPage extends React.PureComponent {
  getOrgName = () => this.props.match.params.orgName;

  componentDidMount() {
    this.props.startRequestGroup(this.getOrgName());
  }
  
  componentDidUpdate() {
    this.props.startRequestGroup(this.getOrgName());
  }

  render() {
    if (!this.getOrgName()) {
      return null;
    }

    if (this.props.requestStatus === REQUEST_STATUS.FAILED) {
      return <p>Request for {this.getOrgName()} failed</p>;
    }

    const cachedEntry = this.props.response;
    if (cachedEntry) {
      if (!cachedEntry.response.data.organization) {
        // It could be that the organization is not publicly visible,
        // in which case GH would not even confirm its existence. In that case, 
        // we would want to make this error message a bit more precise. Can
        // organizations be hidden from the public? I'm not sure, but it doesn't
        // seem like a great use of time to find out. :)
        return <p>Organization {this.getOrgName()} does not exist.</p>;
      }

      return <BareList>
        {
          cachedEntry.response.data.organization.repositories.nodes.map(repo => 
            <li key={repo.name}><RepoResultItem repo={repo} /></li>
          )
        }
      </BareList>;
    }

    return <p>Loading: {this.getOrgName()}</p>;
  }
}

const ResultsPage = connect(
  (state, ownProps) => ({
    requestStatus: state.requestStatuses[ownProps.match.params.orgName],
    response: state.responses[ownProps.match.params.orgName]
  }),
  dispatch => bindActionCreators({
    startRequestGroup
  }, dispatch)
)(UnconnectedResultsPage);

export default withRouter(ResultsPage);