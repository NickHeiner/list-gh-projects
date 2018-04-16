import React from 'react';
import NumberFormat from 'react-number-format';

const FormattedNumber = ({children}) => <NumberFormat value={children} displayType="text" thousandSeparator />;

export default FormattedNumber;
