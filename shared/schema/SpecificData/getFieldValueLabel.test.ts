import { describe, expect, test } from 'vitest';
import { TargetingCriteriaFieldConfig } from '../../test/specificDataFixtures';
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
});
