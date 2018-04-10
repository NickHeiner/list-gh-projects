import React from 'react';
import NumberFormat from 'react-number-format';

const FormattedNumber = ({val}) => <NumberFormat value={val} displayType="text" thousandSeparator />;

export default FormattedNumber;
