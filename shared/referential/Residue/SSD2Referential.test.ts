import { expect, test } from 'vitest';
import { getSSD2IdByCasNumber, getSSD2IdByLabel } from './SSD2Referential';

test('getSSD2IdByCasNumber', () => {
  expect(getSSD2IdByCasNumber('wrongCasNumber')).toEqual(null)
  expect(getSSD2IdByCasNumber('122-18-9')).toMatchInlineSnapshot(`"RF-1078-006-PPP"`)
})

test('getSSD2IdByLabel', () => {
  expect(getSSD2IdByLabel('wrongLabel')).toEqual(null)
  expect(getSSD2IdByLabel('Flufenace')).toEqual(null)
  expect(getSSD2IdByLabel('FlufenaCet')).toMatchInlineSnapshot(`"RF-0203-002-PPP"`)
  expect(getSSD2IdByLabel('flufenacet')).toMatchInlineSnapshot(`"RF-0203-002-PPP"`)
  expect(getSSD2IdByLabel('DIphenylsulfon')).toMatchInlineSnapshot(`"RF-1063-001-PPP"`)
})
