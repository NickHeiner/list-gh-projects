import React from 'react';
import {withRouter} from 'react-router-dom';
import {css} from 'glamor';
import RepoResultItem from './RepoResultItem';
import {REQUEST_STATUS, REPO_ROW_HEIGHT} from './Constants';
import {connect} from 'react-redux';
import {startRequestGroup, setRepoFilter} from './redux/actions';
import {bindActionCreators} from 'redux';
import _ from 'lodash';
import {AutoSizer, List} from 'react-virtualized';
import getStringMatch from './GetStringMatch';
import OrgSummary from './OrgSummary';
import BareList from './BareList';

const normalizeOrgName = _.toLower;

class UnconnectedResultsPage extends React.PureComponent {
  getOrgName = () => normalizeOrgName(this.props.match.params.orgName);

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

    const cachedEntry = this.props.response;

    if (cachedEntry) {
      const controlBarStyles = css({
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '10px',
        marginBottom: '10px'
      });
  
      const labelMarginPx = 10;
  
      const labelStyles = css({
        marginRight: `${labelMarginPx}px`
      });
  
      const loadedStyles = css({
        marginRight: `${labelMarginPx * 2}px`
      });
  
      const matchedRepos = _(cachedEntry.repos)
        .values()
        // For perf, we could do this sort in a Redux selector.
        .sortBy(repo => -repo.stargazers.totalCount)
        .map(repo => ({repo, match: getStringMatch(this.props.repoFilter, repo.name)}))
        .filter(repo => !this.props.repoFilter || repo.match)
        .value();
  
      const rootStyles = css({
        display: 'flex', 
        flexDirection: 'column',
        height: '100%'
      });

      return <div {...rootStyles}>
        <div {...controlBarStyles}>
          <span {...loadedStyles}>Loaded {_.size(cachedEntry.repos)} of {cachedEntry.totalCount} repos.</span>
          <div>
            <span {...labelStyles}>Filter repos:</span>
            <input type="text" 
              onChange={this.props.setRepoFilter} 
              value={this.props.repoFilter} 
              placeholder={_(cachedEntry.repos).keys().first()} />
          </div>
        </div>
        <BareList>
          
          <AutoSizer>
            {({height, width}) => (
              <List
                rowCount={matchedRepos.length + 1}
                height={height}
                rowHeight={REPO_ROW_HEIGHT}
                // TODO It's considered poor form to define an inline function in render(), because it dooms
                // us to always re-rendering the component, because the props will always be different, 
                // because two separately created functions will never be evaluated as equal.
                rowRenderer={
                  ({index, key, style}) => 
                    index
                      ? <li key={key} style={style}><RepoResultItem matchedRepo={matchedRepos[index - 1]} /></li>
                      : <OrgSummary org={cachedEntry} />
                }
                width={width}
              />
            )}
          </AutoSizer>
        </BareList>
      </div>;
    }

    if (this.props.requestStatus === REQUEST_STATUS.FAILED) {
      return <p>Request for {this.getOrgName()} failed.</p>;
    }

    if (cachedEntry === null) {
      // It could be that the organization is not publicly visible,
      // in which case GH would not even confirm its existence. In that case, 
      // we would want to make this error message a bit more precise. Can
      // organizations be hidden from the public? I'm not sure, but it doesn't
      // seem like a great use of time to find out. :)
      return <p>Organization {this.getOrgName()} does not exist.</p>;
    }

    return <p>Loading: {this.getOrgName()}.</p>;
  }
}

const ResultsPage = connect(
  (state, ownProps) => ({
    repoFilter: state.repoFilter,
    requestStatus: state.requestStatuses[normalizeOrgName(ownProps.match.params.orgName)],
    response: state.responses[normalizeOrgName(ownProps.match.params.orgName)]
  }),
  dispatch => bindActionCreators({
    startRequestGroup,
    setRepoFilter
  }, dispatch)
)(UnconnectedResultsPage);

export default withRouter(ResultsPage);
