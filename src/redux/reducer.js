import {names} from './actions';
import update from 'immutability-helper';

const reducer = (state, action) => {
  switch (action.type) {
  case names.INCREMENT: 
    return update(state, {
      counter: {
        $apply: x => x + 1
      }
    });
  case names.INCREMENT_START: {
    return update(state, {
      counterLoading: {$set: true}
    });
  }
  case names.INCREMENT_END: {
    return update(state, {
      counterLoading: {$set: false}
    });
  }
  default:
    return state;
  }
};

export default reducer;
