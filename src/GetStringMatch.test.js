import _ from 'lodash';
import getStringMatch from './GetStringMatch';

it('returns null for no match', () => {
  expect(getStringMatch('demo', 'no-match')).toBeNull();
});

it('returns null for no match when prefix matches', () => {
  expect(getStringMatch('prefix', 'pre-no-match')).toBeNull();
});

it('returns null when ordering is incorrect', () => {
  expect(getStringMatch('rnf', 'augmented-traffic-control')).toBeNull();
});

it('finds an exact match', () => {
  expect(getStringMatch('exact', 'exact')).toEqual(_.range('exact'.length));
});

it('is case-insensitive', () => {
  expect(getStringMatch('case', 'CASE')).toEqual(_.range('case'.length));
});

it('finds a match with other interspersed characters', () => {
  expect(getStringMatch('ab', 'a-b-')).toEqual([0, 2]);
});
