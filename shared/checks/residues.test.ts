import { expect, test } from 'vitest';
import { lmrIsRequired } from './residues';

test('lmrIsRequired', () => {
  expect(lmrIsRequired('PART1', 'STADE1', 'NQ')).toEqual(false);
  expect(lmrIsRequired('PART1', 'STADE1', 'Q')).toEqual(true);
  expect(lmrIsRequired('PART1', 'STADE2', 'Q')).toEqual(false);
  expect(lmrIsRequired('PART2', 'STADE1', 'Q')).toEqual(false);
  expect(lmrIsRequired('PART2', 'STADE2', 'Q')).toEqual(false);
  expect(lmrIsRequired('PART2', null, 'Q')).toEqual(false);
  expect(lmrIsRequired(null, 'STADE2', 'Q')).toEqual(false);
  expect(lmrIsRequired(null, 'STADE1', 'Q')).toEqual(true);
});
