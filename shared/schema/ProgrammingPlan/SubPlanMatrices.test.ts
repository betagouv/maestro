import { describe, expect, test } from 'vitest';
import { MatrixReferentialFixture } from '../../test/matrixFixtures';
import { genSubPlanMatrices } from '../../test/programmingPlanFixtures';
import type { Matrix, MatrixKind } from '../Matrix/MatrixReferential';
import {
  getSubPlanMatrixKinds,
  getSubPlanMatrixLabels,
  isMatrixSelected,
  SubPlanMatrices,
  subPlanMatrixNameParts
} from './SubPlanMatrices';

describe('SubPlanMatrices', () => {
  test('should accept several matrix kinds with an operator', () => {
    expect(
      SubPlanMatrices.safeParse({
        operator: 'And',
        items: [
          { matrixKind: 'A00QT', matrices: [] },
          { matrixKind: 'A01GP', matrices: ['A01GS'] }
        ]
      }).success
    ).toBe(true);
  });

  test('should refuse an empty selection', () => {
    expect(
      SubPlanMatrices.safeParse({ operator: 'Or', items: [] }).success
    ).toBe(false);
  });

  test('should refuse a matrix kind selected twice', () => {
    expect(
      SubPlanMatrices.safeParse({
        operator: 'Or',
        items: [
          { matrixKind: 'A01GP', matrices: [] },
          { matrixKind: 'A01GP', matrices: ['A01GS'] }
        ]
      }).success
    ).toBe(false);
  });
});

describe('isMatrixSelected', () => {
  test('should not select any matrix of an unselected matrix kind', () => {
    expect(isMatrixSelected(undefined, 'A01GS' as Matrix)).toBe(false);
  });

  test('should select every matrix of a matrix kind without detailed matrices', () => {
    expect(
      isMatrixSelected(
        { matrixKind: 'A01GP' as MatrixKind, matrices: [] },
        'A01GS' as Matrix
      )
    ).toBe(true);
  });

  test('should select only the detailed matrices of a matrix kind', () => {
    const item = {
      matrixKind: 'A01GP' as MatrixKind,
      matrices: ['A01GS' as Matrix]
    };

    expect(isMatrixSelected(item, 'A01GS' as Matrix)).toBe(true);
    expect(isMatrixSelected(item, 'A0DVG' as Matrix)).toBe(false);
  });
});

describe('getSubPlanMatrixKinds', () => {
  test('should list the selected matrix kinds', () => {
    expect(
      getSubPlanMatrixKinds({
        operator: 'Or',
        items: [
          { matrixKind: 'A00QT' as MatrixKind, matrices: [] },
          { matrixKind: 'A01GP' as MatrixKind, matrices: ['A01GS'] as Matrix[] }
        ]
      })
    ).toStrictEqual(['A00QT', 'A01GP']);
  });

  test('should list nothing without matrices', () => {
    expect(getSubPlanMatrixKinds(null)).toStrictEqual([]);
  });
});

describe('getSubPlanMatrixLabels', () => {
  test('should label a matrix kind without detailed matrices, and the detailed matrices otherwise', () => {
    expect(
      getSubPlanMatrixLabels(MatrixReferentialFixture, {
        operator: 'Or',
        items: [
          { matrixKind: 'A00QT' as MatrixKind, matrices: [] },
          {
            matrixKind: 'A01GP' as MatrixKind,
            matrices: ['A01GS', 'A0DVG'] as Matrix[]
          }
        ]
      })
    ).toStrictEqual(['Radis et similaires', 'Mirabelles', 'Plumcots']);
  });
});

describe('subPlanMatrixNameParts', () => {
  test('should name a single detailed matrix by that matrix', () => {
    expect(
      subPlanMatrixNameParts(
        MatrixReferentialFixture,
        genSubPlanMatrices('A01GP' as MatrixKind, ['A01GS'] as Matrix[])
      )
    ).toStrictEqual(['Mirabelles']);
  });

  test('should fall back to the category when several matrices are detailed', () => {
    expect(
      subPlanMatrixNameParts(
        MatrixReferentialFixture,
        genSubPlanMatrices(
          'A01GP' as MatrixKind,
          ['A01GS', 'A0DVG'] as Matrix[]
        )
      )
    ).toStrictEqual(['Prunes et similaires']);
  });

  test('should keep every category when several are detailed across items', () => {
    expect(
      subPlanMatrixNameParts(MatrixReferentialFixture, {
        operator: 'Or',
        items: [
          {
            matrixKind: 'A00QT' as MatrixKind,
            matrices: ['A00QV'] as Matrix[]
          },
          { matrixKind: 'A01GP' as MatrixKind, matrices: ['A01GS'] as Matrix[] }
        ]
      })
    ).toStrictEqual(['Radis et similaires', 'Prunes et similaires']);
  });

  test('should keep the untouched categories alongside a single detailed matrix', () => {
    expect(
      subPlanMatrixNameParts(MatrixReferentialFixture, {
        operator: 'Or',
        items: [
          { matrixKind: 'A00QT' as MatrixKind, matrices: [] },
          { matrixKind: 'A01GP' as MatrixKind, matrices: ['A01GS'] as Matrix[] }
        ]
      })
    ).toStrictEqual(['Radis et similaires', 'Mirabelles']);
  });

  test('should name nothing without matrices', () => {
    expect(
      subPlanMatrixNameParts(MatrixReferentialFixture, null)
    ).toStrictEqual([]);
  });
});
