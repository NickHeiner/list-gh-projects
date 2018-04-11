import React from 'react';
import {withRouter} from 'react-router-dom';
import {css} from 'glamor';
import RepoResultItem from './RepoResultItem';
import {REQUEST_STATUS} from './Constants';
import {connect} from 'react-redux';
import {startRequestGroup, setRepoFilter} from './redux/actions';
import {bindActionCreators} from 'redux';
import _ from 'lodash';

const BareList = ({children}) => {
  const styles = css({
    paddingLeft: 0,
    listStyle: 'none',
    marginTop: 0
  });
  return <ul {...styles}>{children}</ul>;
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
      return <p>Request for {this.getOrgName()} failed.</p>;
    }

    const cachedEntry = this.props.response;
    if (cachedEntry === null) {
      // It could be that the organization is not publicly visible,
      // in which case GH would not even confirm its existence. In that case, 
      // we would want to make this error message a bit more precise. Can
      // organizations be hidden from the public? I'm not sure, but it doesn't
      // seem like a great use of time to find out. :)
      return <p>Organization {this.getOrgName()} does not exist.</p>;
    }

    if (!cachedEntry) {
      return <p>Loading: {this.getOrgName()}.</p>;
    }

    const controlBarStyles = css({
      display: 'flex',
      marginTop: '10px',
      marginBottom: '10px'
    });

    const labelStyles = css({
      marginRight: '10px'
    });

    // TODO This is not working and I'm not sure why.
    const filterStyles = css({
      alignSelf: 'flex-end'
    });

    return <div>
      <div {...controlBarStyles}>
        <span>Loaded {_.size(cachedEntry.repos)} of {cachedEntry.totalCount} repos.</span>
        <div {...filterStyles}>
          <span {...labelStyles}>Filter repos:</span>
          <input type="text" 
            onChange={this.props.setRepoFilter} 
            value={this.props.repoFilter} 
            placeholder={_(cachedEntry.repos).keys().first()} />
        </div>
      </div>
      {/* TODO use react-virtualized here. */}
      <BareList>
        {
          _(cachedEntry.repos)
            .values()
            // For perf, we could do this sort in a Redux selector.
            .sortBy(repo => -repo.stargazers.totalCount)
            .filter(repo => !this.props.repoFilter || repo.name.includes(this.props.repoFilter))
            .map(repo => 
              <li key={repo.name}><RepoResultItem repo={repo} /></li>
            )
            .value()
        }
      </BareList>
    </div>;
  }
}

const ResultsPage = connect(
  (state, ownProps) => ({
    repoFilter: state.repoFilter,
    requestStatus: state.requestStatuses[ownProps.match.params.orgName],
    response: state.responses[ownProps.match.params.orgName]
  }),
  dispatch => bindActionCreators({
    startRequestGroup,
    setRepoFilter
  }, dispatch)
)(UnconnectedResultsPage);

export default withRouter(ResultsPage);
