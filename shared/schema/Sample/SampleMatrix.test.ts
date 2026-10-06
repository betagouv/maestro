import { describe, expect, test } from 'vitest';
import { CompanyFixture } from '../../test/companyFixtures';
import { genCreatedSample } from '../../test/sampleFixtures';
import type { SubPlanMatrices } from '../ProgrammingPlan/SubPlanMatrices';
import { SampleChecked } from './Sample';
import {
  getSampleMatrixLabels,
  SampleMatrix,
  sampleMatricesIssues
} from './SampleMatrix';

const radishAndPlums = (operator: SubPlanMatrices['operator']) =>
  ({
    operator,
    items: [
      { matrixKind: 'A00QT', matrices: ['A00QV', 'A00QX'] },
      { matrixKind: 'A01GP', matrices: [] }
    ]
  }) satisfies SubPlanMatrices;

describe('SampleMatrix', () => {
  test('refuse une matrice hors référentiel pour une catégorie programmée', () => {
    expect(
      SampleMatrix.safeParse({ matrixKind: 'A00QT', matrix: 'Navet' }).success
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
      getSampleMatrixLabels([
        { matrixKind: 'A00GY', matrix: 'A00GZ' },
        { matrixKind: 'Other', matrix: 'Navet' },
        { matrixKind: 'A00QT', matrix: null }
      ])
    ).toStrictEqual(['Aulx', 'Navet']);
  });
});

describe('sampleMatricesIssues', () => {
  test('sans matrices au sous-plan, aucune contrainte', () => {
    expect(
      sampleMatricesIssues([{ matrixKind: 'A00GY', matrix: 'A00GZ' }], null)
    ).toStrictEqual([]);
  });

  test('OU : accepte une seule matrice parmi la sélection', () => {
    expect(
      sampleMatricesIssues(
        [{ matrixKind: 'A01GP', matrix: 'A01GQ' }],
        radishAndPlums('Or')
      )
    ).toStrictEqual([]);
  });

  test('OU : refuse plusieurs matrices', () => {
    expect(
      sampleMatricesIssues(
        [
          { matrixKind: 'A00QT', matrix: 'A00QV' },
          { matrixKind: 'A01GP', matrix: 'A01GQ' }
        ],
        radishAndPlums('Or')
      )
    ).toStrictEqual([
      { path: ['matrices'], message: 'Une seule matrice est attendue.' }
    ]);
  });

  test('OU : refuse une liste vide', () => {
    expect(sampleMatricesIssues([], radishAndPlums('Or'))).toStrictEqual([
      { path: ['matrices'], message: 'Veuillez renseigner la matrice.' }
    ]);
  });

  test('ET : accepte une matrice de chaque catégorie', () => {
    expect(
      sampleMatricesIssues(
        [
          { matrixKind: 'A00QT', matrix: 'A00QX' },
          { matrixKind: 'A01GP', matrix: 'A01GQ' }
        ],
        radishAndPlums('And')
      )
    ).toStrictEqual([]);
  });

  test('ET : signale une catégorie manquante et une catégorie en double', () => {
    expect(
      sampleMatricesIssues(
        [
          { matrixKind: 'A01GP', matrix: 'A01GQ' },
          { matrixKind: 'A01GP', matrix: 'A01HA' }
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
      sampleMatricesIssues(
        [
          { matrixKind: 'A00KR', matrix: 'A00KT' },
          { matrixKind: 'A00KT', matrix: 'A00KT' }
        ],
        {
          operator: 'And',
          items: [
            { matrixKind: 'A00KR', matrices: [] },
            { matrixKind: 'A00KT', matrices: [] }
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
      sampleMatricesIssues(
        [
          { matrixKind: 'A00QT', matrix: 'A00QY' },
          { matrixKind: 'A00GY', matrix: 'A00GZ' }
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
