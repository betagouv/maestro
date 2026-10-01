import { describe, expect, test } from 'vitest';
import { genProgrammingSubPlan } from '../../test/programmingPlanFixtures';
import { subPlanLabel } from './ProgrammingSubPlan';

describe('subPlanLabel', () => {
  test('should join the stage, the matrices, the analytes and the context', () => {
    expect(
      subPlanLabel(
        genProgrammingSubPlan({
          stages: ['PRODUCTION_PRIMAIRE_VEGETALE'],
          substanceKinds: ['Multi'],
          matrices: {
            operator: 'Or',
            items: [{ matrixKind: 'A01GP', matrices: ['A01GS'] }]
          },
          context: 'Surveillance'
        })
      )
    ).toBe(
      'Production primaire végétale - Mirabelles - Multi-résidus - Plan de surveillance'
    );
  });

  test('should join several stages and several analytes', () => {
    expect(
      subPlanLabel(
        genProgrammingSubPlan({
          stages: ['ELEVAGE', 'ABATTAGE'],
          substanceKinds: ['Mono', 'Multi'],
          matrices: {
            operator: 'Or',
            items: [{ matrixKind: 'A01GP', matrices: [] }]
          },
          context: 'Control'
        })
      )
    ).toBe(
      'Élevage, Abattage - Prunes et similaires - Mono-résidu, Multi-résidus - Plan de contrôle'
    );
  });

  test('should skip the missing parts', () => {
    expect(
      subPlanLabel(
        genProgrammingSubPlan({
          stages: null,
          substanceKinds: null,
          matrices: null,
          context: 'Control'
        })
      )
    ).toBe('Plan de contrôle');
  });

  test('should name nothing when every part is missing', () => {
    expect(
      subPlanLabel(
        genProgrammingSubPlan({
          stages: [],
          substanceKinds: [],
          matrices: null,
          context: null
        })
      )
    ).toBe('');
  });
});
