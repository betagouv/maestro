import { expect, test } from 'vitest';
import { getSSD2Id } from './SSD2Referential';

test('getSSD2IdByCasNumber', () => {
  expect(getSSD2Id('', null, 'wrongCasNumber')).toEqual(null)
  expect(getSSD2Id('', null, '122-18-9')).toMatchInlineSnapshot(`"RF-1078-006-PPP"`)
})

test('getSSD2IdByLabel', () => {
  expect(getSSD2Id('wrongLabel', null, null)).toEqual(null)
  expect(getSSD2Id('Flufenace', null, null)).toEqual(null)
  expect(getSSD2Id('FlufenaCet', null, null)).toMatchInlineSnapshot(`"RF-0203-002-PPP"`)
  expect(getSSD2Id('flufenacet', null, null)).toMatchInlineSnapshot(`"RF-0203-002-PPP"`)
  expect(getSSD2Id('DIphenylsulfon', null, null)).toMatchInlineSnapshot(`"RF-1063-001-PPP"`)
})
