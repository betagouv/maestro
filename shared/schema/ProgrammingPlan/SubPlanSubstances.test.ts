import { describe, expect, test } from 'vitest';
import { SubPlanSubstances } from './SubPlanSubstances';

describe('SubPlanSubstances', () => {
  test('accepts substances for the mono and multi residue analytes', () => {
    expect(
      SubPlanSubstances.safeParse({
        Mono: ['RF-1020-001-PPP'],
        Multi: ['RF-0440-001-PPP']
      }).success
    ).toBe(true);
  });

  test('rejects substances for another analyte', () => {
    expect(
      SubPlanSubstances.safeParse({ Copper: ['RF-1020-001-PPP'] }).success
    ).toBe(false);
  });
});
