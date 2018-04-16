import React from 'react';
import {css} from 'glamor';
import _ from 'lodash';

const HighlightMatches = ({matches, toHighlight}) => {
  const highlightStyles = css({
    backgroundColor: 'yellow'
  });

  return <React.Fragment>
    {
      _.map(toHighlight, (char, index) => {
        const styles = matches.includes(index) ? highlightStyles : {};
        return <span {...styles} key={`${char}-${index}`}>{char}</span>;
      })
    }
  </React.Fragment>;
};

export default HighlightMatches;
