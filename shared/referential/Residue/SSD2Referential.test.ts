import { expect, test } from 'vitest';
import { SSD2Id } from './SSD2Id';
import { getSSD2Id, SSD2Referential } from './SSD2Referential';

test('getSSD2IdByCasNumber', () => {
  expect(getSSD2Id('', null, 'wrongCasNumber')).toEqual(null);
  expect(getSSD2Id('', null, '122-18-9')).toMatchInlineSnapshot(
    `"RF-1078-006-PPP"`
  );
});

test('getSSD2IdByLabel', () => {
  expect(getSSD2Id('wrongLabel', null, null)).toEqual(null);
  expect(getSSD2Id('Flufenace', null, null)).toEqual(null);
  expect(getSSD2Id('FlufenaCet', null, null)).toMatchInlineSnapshot(
    `"RF-0203-002-PPP"`
  );
  expect(getSSD2Id('flufenacet', null, null)).toMatchInlineSnapshot(
    `"RF-0203-002-PPP"`
  );
  expect(getSSD2Id('DIphenylsulfon', null, null)).toMatchInlineSnapshot(
    `"RF-1063-001-PPP"`
  );
});

test('les codes générés par Maestro font partie du référentiel', () => {
  expect(SSD2Referential['MAESTRO-CYPROSULFAMIDE']).toBeDefined();
  expect(getSSD2Id('cyprosulfamide', null, null)).toEqual(
    'MAESTRO-CYPROSULFAMIDE'
  );
  expect(SSD2Id.safeParse('MAESTRO-CYPROSULFAMIDE').success).toEqual(true);
});
