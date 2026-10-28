import { describe, expect, test } from 'vitest';
import {
  BatchWeightFieldConfig,
  TargetingCriteriaFieldConfig
} from '../../test/specificDataFixtures';
import { getFieldValueLabel } from './getFieldValueLabel';

describe('getFieldValueLabel', () => {
  test('joins the labels of a multiselect value', () => {
    expect(
      getFieldValueLabel(TargetingCriteriaFieldConfig, ['THIN', 'INJURED'])
    ).toBe('Animal maigre, Animal blessé');
  });

  test('returns null for a multiselect without value', () => {
    expect(getFieldValueLabel(TargetingCriteriaFieldConfig, [])).toBeNull();
  });

  test('writes a decimal value with a comma', () => {
    expect(getFieldValueLabel(BatchWeightFieldConfig, 2.5)).toBe('2,5');
  });
});
