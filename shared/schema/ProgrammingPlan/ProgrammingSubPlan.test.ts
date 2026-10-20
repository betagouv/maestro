import { describe, expect, test } from 'vitest';
import { MatrixReferentialFixture } from '../../test/matrixFixtures';
import {
  genProgrammingSubPlan,
  genSubPlanMatrices
} from '../../test/programmingPlanFixtures';
import type { Matrix, MatrixKind } from '../Matrix/MatrixReferential';
import { analysisPermissionRoles, subPlanLabel } from './ProgrammingSubPlan';

describe('subPlanLabel', () => {
  test('should join the stage, the matrices, the analytes and the context', () => {
    expect(
      subPlanLabel(
        MatrixReferentialFixture,
        genProgrammingSubPlan({
          stages: ['PRODUCTION_PRIMAIRE_VEGETALE'],
          substanceKinds: ['Multi'],
          matrices: genSubPlanMatrices('A01GP' as MatrixKind, [
            'A01GS' as Matrix
          ]),
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
        MatrixReferentialFixture,
        genProgrammingSubPlan({
          stages: ['ELEVAGE', 'ABATTAGE'],
          substanceKinds: ['Mono', 'Multi'],
          matrices: genSubPlanMatrices('A01GP' as MatrixKind),
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
        MatrixReferentialFixture,
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
        MatrixReferentialFixture,
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

describe('analysisPermissionRoles', () => {
  test('should allow the sampler and the regional coordinator on a PPV sub-plan', () => {
    expect(
      analysisPermissionRoles(
        genProgrammingSubPlan({
          subPlanNumber: 'PPV01',
          stages: ['PRODUCTION_PRIMAIRE_VEGETALE']
        })
      )
    ).toEqual(['Sampler', 'RegionalCoordinator']);
  });

  test('should allow only the departmental coordinator on a slaughterhouse sub-plan', () => {
    expect(
      analysisPermissionRoles(
        genProgrammingSubPlan({
          subPlanNumber: 'M01',
          stages: ['ELEVAGE', 'ABATTAGE']
        })
      )
    ).toEqual(['DepartmentalCoordinator']);
  });

  test('should allow the sampler and the departmental coordinator on any other sub-plan', () => {
    expect(
      analysisPermissionRoles(
        genProgrammingSubPlan({ subPlanNumber: 'M03', stages: ['ELEVAGE'] })
      )
    ).toEqual(['Sampler', 'DepartmentalCoordinator']);
    expect(
      analysisPermissionRoles(
        genProgrammingSubPlan({ subPlanNumber: 'M03', stages: null })
      )
    ).toEqual(['Sampler', 'DepartmentalCoordinator']);
  });
});
