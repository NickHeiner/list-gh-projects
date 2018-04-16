import React from 'react';
import FormattedNumber from './FormattedNumber';
import {css} from 'glamor';

const ColoredText = ({children, color}) => <span {...css({color})}>{children}</span>;

const DiffAdditionsDeletions = ({additions, deletions}) => <React.Fragment>
  (<ColoredText color="#28a745">+<FormattedNumber>{additions}</FormattedNumber></ColoredText>
  /<ColoredText color="#cb2431">-<FormattedNumber>{deletions}</FormattedNumber></ColoredText>)
</React.Fragment>;

export default DiffAdditionsDeletions;
