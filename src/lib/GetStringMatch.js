import _ from 'lodash';

const getStringMatch = (rawQuery, rawString) => {
  const query = rawQuery.toLowerCase();
  const string = rawString.toLowerCase();
  const matchIndexes = [];

  for (let queryIndex = 0; queryIndex < query.length; queryIndex++) {
    const searchLowerBound = _.last(matchIndexes) + 1 || 0;
    const char = query[queryIndex];
    const nextIndex = string.indexOf(char, searchLowerBound);
    if (nextIndex < 0) {
      return null;
    }
  
    matchIndexes.push(nextIndex);
  }

  return matchIndexes;
};

export default getStringMatch;
