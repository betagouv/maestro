import { describe, expect, test } from 'vitest';
import { PPVValidatedSubPlanId } from '../../test/programmingPlanFixtures';
import {
  BatchWeightFieldConfig,
  TargetingCriteriaFieldConfig
} from '../../test/specificDataFixtures';
import { buildSpecificDataSchema } from './buildSpecificDataSchema';
import {
  type FieldConfig,
  ProgrammingSubPlanFieldId
} from './ProgrammingSubPlanFieldConfig';

const fieldSchema = (field: FieldConfig, required: boolean) =>
  buildSpecificDataSchema([
    {
      id: ProgrammingSubPlanFieldId.parse(crypto.randomUUID()),
      programmingSubPlanId: PPVValidatedSubPlanId,
      inheritance: 'Own',
      required,
      order: 0,
      field
    }
  ]);

const targetingCriteriaSchema = (required: boolean) =>
  fieldSchema(TargetingCriteriaFieldConfig, required);

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

  describe('decimal', () => {
    test('accepts a decimal value', () => {
      expect(
        fieldSchema(BatchWeightFieldConfig, true).safeParse({
          batchWeight: '2.5'
        }).data
      ).toEqual({ batchWeight: 2.5 });
    });

    test('refuses a negative value', () => {
      expect(
        fieldSchema(BatchWeightFieldConfig, false).safeParse({
          batchWeight: -1
        }).success
      ).toBe(false);
    });
  });
});
