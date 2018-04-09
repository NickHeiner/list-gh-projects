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
      <input type="text" placeholder="netflix" onChange={this.handleOrgNameChange} />
    </div>;
  }
}

const Header = withRouter(RouterlessHeader);

const RouteFrame = () => <Router>
  <React.Fragment>
    <Header />
    <Route index path="/:orgName" component={ResultsPage} />
  </React.Fragment>
</Router>;

export default RouteFrame;
