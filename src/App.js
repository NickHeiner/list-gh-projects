import {
  HashRouter as Router,
  Route
} from 'react-router-dom';

import React from 'react';
import './App.css';

const Header = () => <div>
  <h1>List GH Projects</h1>
  <input type="text" placeholder="netflix" />
</div>;

const ResultsPage = ({match}) => <p>Org name: {match.params.orgName}</p>

const RouteFrame = () => <Router>
  <React.Fragment>
    <Header />
    <Route index path="/:orgName" component={ResultsPage} />
  </React.Fragment>
</Router>;

export default RouteFrame;
