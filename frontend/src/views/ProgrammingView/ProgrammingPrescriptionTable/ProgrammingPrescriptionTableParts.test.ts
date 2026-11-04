import { describe, expect, test } from 'vitest';
import { toPlanGroupKeyString } from './ProgrammingPrescriptionTableParts';

describe('toPlanGroupKeyString', () => {
  test('should give the same key whatever the order of the stages and sub-stages', () => {
    expect(
      toPlanGroupKeyString({
        context: 'Control',
        stages: [
          {
            stage: 'TRANSFORMATION',
            subStages: ['USINE_TRANSFORMATION', 'ENTREPOT']
          },
          { stage: 'ABATTAGE', subStages: [] }
        ]
      })
    ).toBe(
      toPlanGroupKeyString({
        context: 'Control',
        stages: [
          { stage: 'ABATTAGE', subStages: [] },
          {
            stage: 'TRANSFORMATION',
            subStages: ['ENTREPOT', 'USINE_TRANSFORMATION']
          }
        ]
      })
    );
  });

  test('should separate the sub-plans of a same stage with different sub-stages', () => {
    expect(
      toPlanGroupKeyString({
        context: 'Control',
        stages: [{ stage: 'TRANSFORMATION', subStages: ['ENTREPOT'] }]
      })
    ).not.toBe(
      toPlanGroupKeyString({
        context: 'Control',
        stages: [{ stage: 'TRANSFORMATION', subStages: [] }]
      })
    );
  });
});
