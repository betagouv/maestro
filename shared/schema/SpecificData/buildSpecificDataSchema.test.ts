import { describe, expect, test } from 'vitest';
import { PPVValidatedSubPlanId } from '../../test/programmingPlanFixtures';
import { TargetingCriteriaFieldConfig } from '../../test/specificDataFixtures';
import { buildSpecificDataSchema } from './buildSpecificDataSchema';
import { ProgrammingSubPlanFieldId } from './ProgrammingSubPlanFieldConfig';

const targetingCriteriaSchema = (required: boolean) =>
  buildSpecificDataSchema([
    {
      id: ProgrammingSubPlanFieldId.parse(crypto.randomUUID()),
      programmingSubPlanId: PPVValidatedSubPlanId,
      inheritance: 'Own',
      required,
      order: 0,
      field: TargetingCriteriaFieldConfig
    }
  ]);

describe('buildSpecificDataSchema', () => {
  describe('multiselect', () => {
    test('accepts several options', () => {
      expect(
        targetingCriteriaSchema(true).safeParse({
          targetingCriteria: ['THIN', 'INJURED']
        }).success
      ).toBe(true);
    });

    test('refuses a value that is not an option', () => {
      expect(
        targetingCriteriaSchema(false).safeParse({
          targetingCriteria: ['THIN', 'UNKNOWN']
        }).success
      ).toBe(false);
    });

    test('refuses no option when the field is required', () => {
      for (const targetingCriteria of [[], null, undefined]) {
        expect(
          targetingCriteriaSchema(true).safeParse({ targetingCriteria }).success
        ).toBe(false);
      }
    });

    test('accepts no option when the field is optional', () => {
      for (const targetingCriteria of [null, undefined]) {
        expect(
          targetingCriteriaSchema(false).safeParse({ targetingCriteria })
            .success
        ).toBe(true);
      }
    });
  });
});
