import { describe, expect, test } from 'vitest';
import { planDistributionKind } from './DistributionKind';

describe('planDistributionKind', () => {
  test('should be regional for a plan with a PPV sub-plan', () => {
    expect(
      planDistributionKind({
        subPlans: [
          {
            subPlanNumber: 'PPV01',
            stages: [{ stage: 'ABATTAGE', subStages: [] }]
          },
          { subPlanNumber: 'M01', stages: null }
        ]
      })
    ).toBe('REGIONAL');
  });

  test('should be slaughterhouse for a plan with a sub-plan at the slaughter stage', () => {
    expect(
      planDistributionKind({
        subPlans: [
          {
            subPlanNumber: 'M01',
            stages: [{ stage: 'ELEVAGE', subStages: [] }]
          },
          {
            subPlanNumber: 'M02',
            stages: [{ stage: 'ABATTAGE', subStages: [] }]
          }
        ]
      })
    ).toBe('SLAUGHTERHOUSE');
  });

  test('should be departmental for any other plan', () => {
    expect(
      planDistributionKind({
        subPlans: [
          {
            subPlanNumber: 'M01',
            stages: [{ stage: 'ELEVAGE', subStages: [] }]
          }
        ]
      })
    ).toBe('DEPARTMENTAL');
    expect(planDistributionKind({ subPlans: [] })).toBe('DEPARTMENTAL');
  });
});
