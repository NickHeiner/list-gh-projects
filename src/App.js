import {
  HashRouter as Router,
  Route,
  withRouter
} from 'react-router-dom';
import ResultsPage from './ResultsPage';
import React from 'react';
import {css} from 'glamor';

class RouterlessHeader extends React.PureComponent {
  handleOrgNameChange = event => {
    this.props.history.push(`/${event.target.value}`);
  }

  render() {
    const styles = css({
      display: 'flex'
    });
    const headerStyles = css({
      color: 'rgba(255,255,255,0.75)',
      marginRight: '10px'
    });
    const inputWrapperStyles = css({
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    });
    const inputHeight = '2rem';
    const inputStyles = css({
      height: inputHeight,
      fontSize: inputHeight,
      backgroundColor: '#404448',
      borderColor: '#292e34',
      color: '#7d8082'
    });
    return <div {...styles}>
      <h1 id="header" {...headerStyles}>View GH projects by org:</h1>
      {/* The `|| ''` in value="" below is to avoid React complaining about switching this
          component from controlled to uncontrolled. When `this.props.match.params.orgName`
          is undefined, React can't tell the difference between "we didn't pass an argument
          for `value`" and "we passed an empty value". We'll disambiguate by providing ''.

          TODO: Add label for accessibility and usability.
      */}
      <div {...inputWrapperStyles}>
        <input type="text" placeholder="netflix"
          aria-labelledby="header" {...inputStyles}
          onChange={this.handleOrgNameChange} value={this.props.match.params.orgName || ''} />
      </div>
    </div>;
  }
}

const Header = withRouter(RouterlessHeader);

const App = () => {
  const styles = css({
    width: '90vw',
    marginLeft: 'auto',
    marginRight: 'auto'
  });

  const headerStyles = css({
    background: '#24292e'
  });

  return <div>
    <div {...headerStyles}>
      <div {...styles} >
        <Header />
      </div>
    </div>
    <div {...styles}>
      <ResultsPage />
    </div>
  </div>;
};

const RouteFrame = () => <Router>
  <Route index path="/:orgName?" component={App} />
</Router>;

export default RouteFrame;
