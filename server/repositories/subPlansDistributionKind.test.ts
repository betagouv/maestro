import { describe, expect, test } from 'vitest';
import { subPlansDistributionKind } from './subPlansDistributionKind';

describe('subPlansDistributionKind', () => {
  test('should be regional for a plan with a PPV sub-plan', () => {
    expect(
      subPlansDistributionKind([
        {
          subPlanNumber: 'PPV01',
          stages: [{ stage: 'ABATTAGE', subStages: [] }]
        },
        { subPlanNumber: 'M01', stages: null }
      ])
    ).toBe('REGIONAL');
  });

  test('should be slaughterhouse for a plan with a sub-plan at the slaughter stage', () => {
    expect(
      subPlansDistributionKind([
        { subPlanNumber: 'M01', stages: [{ stage: 'ELEVAGE', subStages: [] }] },
        { subPlanNumber: 'M02', stages: [{ stage: 'ABATTAGE', subStages: [] }] }
      ])
    ).toBe('SLAUGHTERHOUSE');
  });

  test('should be departmental for any other plan', () => {
    expect(
      subPlansDistributionKind([
        { subPlanNumber: 'M01', stages: [{ stage: 'ELEVAGE', subStages: [] }] }
      ])
    ).toBe('DEPARTMENTAL');
    expect(subPlansDistributionKind([])).toBe('DEPARTMENTAL');
  });
});
