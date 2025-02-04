import { expect, test } from 'vitest';
import { getSSD2IdByCasNumber } from './ssd2';

test('getSSD2IdByCasNumber', () => {
  expect(getSSD2IdByCasNumber('wrongCasNumber')).toEqual(null)
  expect(getSSD2IdByCasNumber('122-18-9')).toMatchInlineSnapshot(`"RF-1078-006-PPP"`)
})