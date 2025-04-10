import { expect, test } from 'vitest';
import { getSSD2Id } from './SSD2Referential';

test('getSSD2IdByCasNumber', () => {
  expect(getSSD2Id('', null, 'wrongCasNumber', {normalizeLabel: label => label})).toEqual(null)
  expect(getSSD2Id('', null, '122-18-9',{normalizeLabel: label => label})).toMatchInlineSnapshot(`"RF-1078-006-PPP"`)
})

test('getSSD2IdByLabel', () => {
  expect(getSSD2Id('wrongLabel', null, null, {normalizeLabel: label => label})).toEqual(null)
  expect(getSSD2Id('Flufenace', null, null, {normalizeLabel: label => label})).toEqual(null)
  expect(getSSD2Id('FlufenaCet', null, null, {normalizeLabel: label => label})).toMatchInlineSnapshot(`"RF-0203-002-PPP"`)
  expect(getSSD2Id('flufenacet', null, null,{normalizeLabel: label => label})).toMatchInlineSnapshot(`"RF-0203-002-PPP"`)
  expect(getSSD2Id('DIphenylsulfon', null, null, {normalizeLabel: label => label})).toMatchInlineSnapshot(`"RF-1063-001-PPP"`)
  expect(getSSD2Id('flufenacet.reg', null, null, {normalizeLabel: label => label.replaceAll('.reg', '')})).toMatchInlineSnapshot(`"RF-0203-002-PPP"`)
})
