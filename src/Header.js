import React from 'react';
import {withRouter} from 'react-router-dom';
import {css} from 'glamor';
import {SMALL_SIZE_MEDIA_QUERY} from './Constants';
import track from './Track';

class Header extends React.PureComponent {
  handleOrgNameChange = event => {
    track('set-org-name', 'from-input', event.target.value);
    this.props.history.push(`/${event.target.value}`);
  }

  render() {
    const styles = css({
      display: 'flex',
      alignItems: 'center',
      [SMALL_SIZE_MEDIA_QUERY]: {
        flexDirection: 'column'
      }
    });
    const headerStyles = css({
      marginTop: '.23em',
      marginBottom: '.23em',
      color: 'rgba(255,255,255,0.75)',
      marginRight: '10px'
    });
    const inputHeight = '2rem';
    const inputStyles = css({
      height: inputHeight,
      fontSize: inputHeight,
      backgroundColor: '#404448',
      border: 0,
      padding: '2px',
      color: 'rgba(255,255,255,0.75)',
      [SMALL_SIZE_MEDIA_QUERY]: {
        marginBottom: '10px'
      },
      flex: 1,
      '::placeholder': {
        color: '#7d8082'
      }
    });
    return <div {...styles}>
      <h1 id="header" {...headerStyles}>View GH projects by org:</h1>
      {/* The `|| ''` in value="" below is to avoid React complaining about switching this
          component from controlled to uncontrolled. When `this.props.match.params.orgName`
          is undefined, React can't tell the difference between "we didn't pass an argument
          for `value`" and "we passed an empty value". We'll disambiguate by providing ''.
      */}
      <input type="text" placeholder="department-of-veterans-affairs"
        aria-labelledby="header" {...inputStyles}
        onChange={this.handleOrgNameChange} value={this.props.match.params.orgName || ''} />
    </div>;
  }
}

export default withRouter(Header);

