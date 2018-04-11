import {
  HashRouter as Router,
  Route,
  withRouter
} from 'react-router-dom';
import ResultsPage from './ResultsPage';
import React from 'react';
import {css} from 'glamor';
import {SMALL_SIZE_MEDIA_QUERY} from './Constants';
import ReduxFrame from './redux/ReduxFrame';
import Header from './Header';

const App = () => {
  const rootStyles = css({
    display: 'flex',
    flexDirection: 'column', 
    height: '100%'
  });

  const wrapperStyles = css({
    width: '90vw',
    marginLeft: 'auto',
    marginRight: 'auto',
    [SMALL_SIZE_MEDIA_QUERY]: {
      width: '95vw'
    },
    flex: 1
  });

  const headerStyles = css({
    background: '#24292e'
  });

  return <div {...rootStyles}>
    <div {...headerStyles}>
      <div {...wrapperStyles} >
        <Header />
      </div>
    </div>
    <div {...wrapperStyles}>
      <ResultsPage />
    </div>
  </div>;
};

const AppFrame = () => <ReduxFrame>
  <Router>
    <Route index path="/:orgName?" component={App} />
  </Router>
</ReduxFrame>;

export default AppFrame;
