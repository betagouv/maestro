import { describe, expect, test } from 'vitest';
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
    expect(isMatrixSelected(undefined, 'A01GS')).toBe(false);
  });

  test('should select every matrix of a matrix kind without detailed matrices', () => {
    expect(
      isMatrixSelected({ matrixKind: 'A01GP', matrices: [] }, 'A01GS')
    ).toBe(true);
  });

  test('should select only the detailed matrices of a matrix kind', () => {
    const item = { matrixKind: 'A01GP' as const, matrices: ['A01GS' as const] };

    expect(isMatrixSelected(item, 'A01GS')).toBe(true);
    expect(isMatrixSelected(item, 'A0DVG')).toBe(false);
  });
});

describe('getSubPlanMatrixKinds', () => {
  test('should list the selected matrix kinds', () => {
    expect(
      getSubPlanMatrixKinds({
        operator: 'Or',
        items: [
          { matrixKind: 'A00QT', matrices: [] },
          { matrixKind: 'A01GP', matrices: ['A01GS'] }
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
      getSubPlanMatrixLabels({
        operator: 'Or',
        items: [
          { matrixKind: 'A00QT', matrices: [] },
          { matrixKind: 'A01GP', matrices: ['A01GS', 'A0DVG'] }
        ]
      })
    ).toStrictEqual(['Radis et similaires', 'Mirabelles', 'Plumcots']);
  });
});

describe('subPlanMatrixNameParts', () => {
  test('should name a single detailed matrix by that matrix', () => {
    expect(
      subPlanMatrixNameParts({
        operator: 'Or',
        items: [{ matrixKind: 'A01GP', matrices: ['A01GS'] }]
      })
    ).toStrictEqual(['Mirabelles']);
  });

  test('should fall back to the category when several matrices are detailed', () => {
    expect(
      subPlanMatrixNameParts({
        operator: 'Or',
        items: [{ matrixKind: 'A01GP', matrices: ['A01GS', 'A0DVG'] }]
      })
    ).toStrictEqual(['Prunes et similaires']);
  });

  test('should keep every category when several are detailed across items', () => {
    expect(
      subPlanMatrixNameParts({
        operator: 'Or',
        items: [
          { matrixKind: 'A00QT', matrices: ['A00QV'] },
          { matrixKind: 'A01GP', matrices: ['A01GS'] }
        ]
      })
    ).toStrictEqual(['Radis et similaires', 'Prunes et similaires']);
  });

  test('should keep the untouched categories alongside a single detailed matrix', () => {
    expect(
      subPlanMatrixNameParts({
        operator: 'Or',
        items: [
          { matrixKind: 'A00QT', matrices: [] },
          { matrixKind: 'A01GP', matrices: ['A01GS'] }
        ]
      })
    ).toStrictEqual(['Radis et similaires', 'Mirabelles']);
  });

  test('should name nothing without matrices', () => {
    expect(subPlanMatrixNameParts(null)).toStrictEqual([]);
  });
});
