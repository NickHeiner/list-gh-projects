import {
  HashRouter as Router,
  Route
} from 'react-router-dom';
import React from 'react';
import {css} from 'glamor';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ResultsPage from './ResultsPage';
import LoadingIndicator from './LoadingIndicator';
import {SMALL_SIZE_MEDIA_QUERY, STYLES} from './Constants';
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
    background: STYLES.HEADER_BACKGROUND_COLOR
  });

  return <div {...rootStyles}>
    <LoadingIndicator />
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
  <MuiThemeProvider>
    <Router>
      <Route index path="/:orgName?" component={App} />
    </Router>
  </MuiThemeProvider>
</ReduxFrame>;

export default AppFrame;
