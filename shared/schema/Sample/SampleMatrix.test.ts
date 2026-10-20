import { describe, expect, test } from 'vitest';
import { CompanyFixture } from '../../test/companyFixtures';
import { MatrixReferentialFixture } from '../../test/matrixFixtures';
import { genCreatedSample } from '../../test/sampleFixtures';
import type { Matrix, MatrixKind } from '../Matrix/MatrixReferential';
import type { SubPlanMatrices } from '../ProgrammingPlan/SubPlanMatrices';
import { SampleChecked } from './Sample';
import {
  getSampleMatrixLabels,
  type PartialSampleMatrix,
  SampleMatrix,
  sampleMatricesIssues
} from './SampleMatrix';

const radishAndPlums = (
  operator: SubPlanMatrices['operator']
): SubPlanMatrices => ({
  operator,
  items: [
    {
      matrixKind: 'A00QT' as MatrixKind,
      matrices: ['A00QV', 'A00QX'] as Matrix[]
    },
    { matrixKind: 'A01GP' as MatrixKind, matrices: [] }
  ]
});

const issues = (
  matrices: PartialSampleMatrix[],
  subPlanMatrices: SubPlanMatrices | null
) => sampleMatricesIssues(MatrixReferentialFixture, matrices, subPlanMatrices);

describe('SampleMatrix', () => {
  test('refuse une matrice vide pour une catégorie programmée', () => {
    expect(
      SampleMatrix.safeParse({ matrixKind: 'A00QT', matrix: '' }).success
    ).toBe(false);
  });

  test('accepte une matrice libre pour la catégorie « Autre »', () => {
    expect(
      SampleMatrix.safeParse({ matrixKind: 'Other', matrix: 'Navet' }).success
    ).toBe(true);
  });
});

describe('getSampleMatrixLabels', () => {
  test('rend le libellé de chaque matrice, et le texte libre pour « Autre »', () => {
    expect(
      getSampleMatrixLabels(MatrixReferentialFixture, [
        { matrixKind: 'A00GY' as MatrixKind, matrix: 'A00GZ' },
        { matrixKind: 'Other', matrix: 'Navet' },
        { matrixKind: 'A00QT' as MatrixKind, matrix: null }
      ])
    ).toStrictEqual(['Aulx', 'Navet']);
  });
});

describe('sampleMatricesIssues', () => {
  test('sans matrices au sous-plan, aucune contrainte', () => {
    expect(
      issues([{ matrixKind: 'A00GY' as MatrixKind, matrix: 'A00GZ' }], null)
    ).toStrictEqual([]);
  });

  test('OU : accepte une seule matrice parmi la sélection', () => {
    expect(
      issues(
        [{ matrixKind: 'A01GP' as MatrixKind, matrix: 'A01GQ' }],
        radishAndPlums('Or')
      )
    ).toStrictEqual([]);
  });

  test('OU : refuse plusieurs matrices', () => {
    expect(
      issues(
        [
          { matrixKind: 'A00QT' as MatrixKind, matrix: 'A00QV' },
          { matrixKind: 'A01GP' as MatrixKind, matrix: 'A01GQ' }
        ],
        radishAndPlums('Or')
      )
    ).toStrictEqual([
      { path: ['matrices'], message: 'Une seule matrice est attendue.' }
    ]);
  });

  test('OU : refuse une liste vide', () => {
    expect(issues([], radishAndPlums('Or'))).toStrictEqual([
      { path: ['matrices'], message: 'Veuillez renseigner la matrice.' }
    ]);
  });

  test('ET : accepte une matrice de chaque catégorie', () => {
    expect(
      issues(
        [
          { matrixKind: 'A00QT' as MatrixKind, matrix: 'A00QX' },
          { matrixKind: 'A01GP' as MatrixKind, matrix: 'A01GQ' }
        ],
        radishAndPlums('And')
      )
    ).toStrictEqual([]);
  });

  test('ET : signale une catégorie manquante et une catégorie en double', () => {
    expect(
      issues(
        [
          { matrixKind: 'A01GP' as MatrixKind, matrix: 'A01GQ' },
          { matrixKind: 'A01GP' as MatrixKind, matrix: 'A01HA' }
        ],
        radishAndPlums('And')
      )
    ).toStrictEqual([
      {
        path: ['matrices'],
        message:
          'Veuillez renseigner une matrice de la catégorie « Radis et similaires ».'
      },
      {
        path: ['matrices'],
        message:
          'Une seule matrice de la catégorie « Prunes et similaires » est attendue.'
      }
    ]);
  });

  test('ET : refuse la même matrice dans deux catégories', () => {
    expect(
      issues(
        [
          { matrixKind: 'A00KR' as MatrixKind, matrix: 'A00KT' },
          { matrixKind: 'A00KT' as MatrixKind, matrix: 'A00KT' }
        ],
        {
          operator: 'And',
          items: [
            { matrixKind: 'A00KR' as MatrixKind, matrices: [] },
            { matrixKind: 'A00KT' as MatrixKind, matrices: [] }
          ]
        }
      )
    ).toStrictEqual([
      {
        path: ['matrices', 1, 'matrix'],
        message: 'Cette matrice est déjà renseignée.'
      }
    ]);
  });

  test('signale une catégorie non programmée et une matrice hors sélection', () => {
    expect(
      issues(
        [
          { matrixKind: 'A00QT' as MatrixKind, matrix: 'A00QY' },
          { matrixKind: 'A00GY' as MatrixKind, matrix: 'A00GZ' }
        ],
        radishAndPlums('Or')
      )
    ).toStrictEqual([
      {
        path: ['matrices', 0, 'matrix'],
        message: 'Cette matrice n’est pas programmée.'
      },
      {
        path: ['matrices', 1, 'matrixKind'],
        message: 'Cette catégorie de matrice n’est pas programmée.'
      },
      { path: ['matrices'], message: 'Une seule matrice est attendue.' }
    ]);
  });
});

describe('SampleChecked', () => {
  test('refuse plusieurs matrices hors programmation', () => {
    expect(
      SampleChecked.safeParse({
        ...genCreatedSample({ department: '44', company: CompanyFixture }),
        context: 'LocalPlan',
        matrices: [
          { matrixKind: 'Other', matrix: 'Navet' },
          { matrixKind: 'Other', matrix: 'Chou' }
        ]
      })
        .error?.issues.filter(({ path }) => path[0] === 'matrices')
        .map(({ path, message }) => ({ path, message }))
    ).toStrictEqual([
      {
        path: ['matrices'],
        message: 'Une seule matrice est attendue hors programmation.'
      }
    ]);
  });
});
