import React from 'react';
import {css} from 'glamor';

const BareList = ({children}) => {
  const styles = css({
    paddingLeft: 0,
    listStyle: 'none',
    marginTop: 0,
    height: '100%'
  });
  return <ul {...styles}>{children}</ul>;
};

export default BareList;
