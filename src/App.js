import {
  HashRouter as Router,
  Route,
  withRouter
} from 'react-router-dom';
import ResultsPage from './ResultsPage';
import React from 'react';
import './App.css';

class RouterlessHeader extends React.PureComponent {
  handleOrgNameChange = event => {
    this.props.history.push(`/${event.target.value}`);
  }

  render() {
    return <div>
      <h1>List GH Projects</h1>
      {/* The `|| ''` in value="" below is to avoid React complaining about switching this
          component from controlled to uncontrolled. When `this.props.match.params.orgName`
          is undefined, React can't tell the difference between "we didn't pass an argument
          for `value`" and "we passed an empty value". We'll disambiguate by providing ''.
      */}
      <input type="text" placeholder="netflix"
        onChange={this.handleOrgNameChange} value={this.props.match.params.orgName || ''} />
    </div>;
  }
}

const Header = withRouter(RouterlessHeader);

const App = () => <React.Fragment>
  <Header />
  <ResultsPage />
</React.Fragment>;

const RouteFrame = () => <Router>
  <Route index path="/:orgName?" component={App} />
</Router>;

export default RouteFrame;
