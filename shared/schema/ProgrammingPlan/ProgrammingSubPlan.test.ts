import { describe, expect, test } from 'vitest';
import { MatrixReferentialFixture } from '../../test/matrixFixtures';
import {
  genProgrammingSubPlan,
  genSubPlanMatrices
} from '../../test/programmingPlanFixtures';
import type { Matrix, MatrixKind } from '../Matrix/MatrixReferential';
import {
  analysisPermissionRoles,
  subPlanLabel,
  subPlanNumberIssue
} from './ProgrammingSubPlan';

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

describe('subPlanNumberIssue', () => {
  const yearSubPlanNumbers = ['M01', 'M02', 'PPV01'];

  test('should accept an unchanged number, even if another sub-plan uses it', () => {
    expect(
      subPlanNumberIssue('M01', 'M01', [...yearSubPlanNumbers, 'M01'])
    ).toBeUndefined();
  });

  test('should accept a number free in the year', () => {
    expect(
      subPlanNumberIssue('M01', 'M09', yearSubPlanNumbers)
    ).toBeUndefined();
  });

  test('should reject an empty number', () => {
    expect(subPlanNumberIssue('M01', '  ', yearSubPlanNumbers)).toBe('Empty');
  });

  test('should reject a number used by another sub-plan of the year', () => {
    expect(subPlanNumberIssue('M01', 'M02', yearSubPlanNumbers)).toBe(
      'Duplicate'
    );
  });

  test.each([
    ['PPV01', 'M05'],
    ['M01', 'PPV05']
  ])('should reject %s → %s, which changes the PPV prefix', (current, next) => {
    expect(subPlanNumberIssue(current, next, yearSubPlanNumbers)).toBe(
      'PPVPrefix'
    );
  });
});
