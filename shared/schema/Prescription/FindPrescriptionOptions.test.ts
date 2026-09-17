import { describe, expect, test } from 'vitest';
import { ExportPrescriptionOptions } from './FindPrescriptionOptions';

const programmingPlanId = '11111111-1111-1111-1111-111111111111';

describe('ExportPrescriptionOptions', () => {
  test('refuse un export sans plan de programmation', () => {
    const parsed = ExportPrescriptionOptions.safeParse({ year: 2026 });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0].message).toBe(
      'programmingPlanId ou programmingPlanIds est requis'
    );
  });

  test('accepte un export avec programmingPlanId', () => {
    expect(
      ExportPrescriptionOptions.safeParse({ programmingPlanId }).success
    ).toBe(true);
  });

  test('accepte un export avec programmingPlanIds', () => {
    expect(
      ExportPrescriptionOptions.safeParse({
        programmingPlanIds: [programmingPlanId]
      }).success
    ).toBe(true);
  });
});
