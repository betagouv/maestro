import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import { describe, expect, test } from 'vitest';
import {
  filterMatrixKinds,
  removeMatrixKind,
  subMatrices,
  toggleMatrix,
  toggleMatrixKind
} from './matrixSelection';

describe('removeMatrixKind', () => {
  test('should remove the matrix kind with its detailed matrices', () => {
    expect(
      removeMatrixKind(
        [
          { matrixKind: 'A00QT', matrices: [] },
          { matrixKind: 'A01GP', matrices: ['A01GS'] }
        ],
        'A01GP'
      )
    ).toStrictEqual([{ matrixKind: 'A00QT', matrices: [] }]);
  });
});

describe('toggleMatrixKind', () => {
  test('should select all the matrices of an unselected matrix kind', () => {
    expect(toggleMatrixKind([], 'A01GP')).toStrictEqual([
      { matrixKind: 'A01GP', matrices: [] }
    ]);
  });

  test('should select all the matrices of a partially selected matrix kind', () => {
    expect(
      toggleMatrixKind(
        [
          { matrixKind: 'A01GP', matrices: ['A01GS', 'A0DVG'] },
          { matrixKind: 'A00QT', matrices: [] }
        ],
        'A01GP'
      )
    ).toStrictEqual([
      { matrixKind: 'A01GP', matrices: [] },
      { matrixKind: 'A00QT', matrices: [] }
    ]);
  });

  test('should remove a fully selected matrix kind', () => {
    expect(
      toggleMatrixKind(
        [
          { matrixKind: 'A00QT', matrices: [] },
          { matrixKind: 'A01GP', matrices: [] }
        ],
        'A01GP'
      )
    ).toStrictEqual([{ matrixKind: 'A00QT', matrices: [] }]);
  });
});

describe('toggleMatrix', () => {
  test('should add the matrix kind when checking one of its matrices', () => {
    expect(
      toggleMatrix([{ matrixKind: 'A00QT', matrices: [] }], 'A01GP', 'A01GS')
    ).toStrictEqual([
      { matrixKind: 'A00QT', matrices: [] },
      { matrixKind: 'A01GP', matrices: ['A01GS'] }
    ]);
  });

  test('should keep the matrices in the referential order', () => {
    expect(
      toggleMatrix(
        [{ matrixKind: 'A01GP', matrices: ['A01GS'] }],
        'A01GP',
        'A01GQ'
      )
    ).toStrictEqual([{ matrixKind: 'A01GP', matrices: ['A01GQ', 'A01GS'] }]);
  });

  test('should detail the other matrices when unchecking a matrix of a fully selected matrix kind', () => {
    expect(
      toggleMatrix([{ matrixKind: 'A01GP', matrices: [] }], 'A01GP', 'A01GS')
    ).toStrictEqual([
      {
        matrixKind: 'A01GP',
        matrices: subMatrices('A01GP').filter((matrix) => matrix !== 'A01GS')
      }
    ]);
  });

  test('should select the whole matrix kind when checking its last unchecked matrix', () => {
    expect(
      toggleMatrix(
        [
          {
            matrixKind: 'A01GP',
            matrices: subMatrices('A01GP').filter(
              (matrix) => matrix !== 'A01GS'
            )
          }
        ],
        'A01GP',
        'A01GS'
      )
    ).toStrictEqual([{ matrixKind: 'A01GP', matrices: [] }]);
  });

  test('should remove the matrix kind when unchecking its last checked matrix', () => {
    expect(
      toggleMatrix(
        [
          { matrixKind: 'A00QT', matrices: [] },
          { matrixKind: 'A01GP', matrices: ['A01GS'] }
        ],
        'A01GP',
        'A01GS'
      )
    ).toStrictEqual([{ matrixKind: 'A00QT', matrices: [] }]);
  });
});

describe('subMatrices', () => {
  test('should list the matrices of the matrix kind', () => {
    expect(subMatrices('A01GP')).toStrictEqual(MatrixListByKind.A01GP);
  });

  test('should exclude the matrix kind itself', () => {
    expect(subMatrices('A00RT')).toStrictEqual([]);
    expect(subMatrices('A001M')).not.toContain('A001M');
    expect(subMatrices('A001M')).toHaveLength(
      MatrixListByKind.A001M.length - 1
    );
  });
});

describe('filterMatrixKinds', () => {
  test('should list every matrix kind sorted by label without search', () => {
    const options = filterMatrixKinds('');
    const prunesIndex = options.findIndex(
      ({ matrixKind }) => matrixKind === 'A01GP'
    );
    const radisIndex = options.findIndex(
      ({ matrixKind }) => matrixKind === 'A00QT'
    );

    expect(prunesIndex).toBeGreaterThanOrEqual(0);
    expect(prunesIndex).toBeLessThan(radisIndex);
    expect(options[prunesIndex]).toStrictEqual({
      matrixKind: 'A01GP',
      matrices: subMatrices('A01GP'),
      matchedByMatrix: false
    });
  });

  test('should keep all matrices of a matrix kind matching by label', () => {
    expect(
      filterMatrixKinds('  PRUNES et ').find(
        ({ matrixKind }) => matrixKind === 'A01GP'
      )
    ).toStrictEqual({
      matrixKind: 'A01GP',
      matrices: subMatrices('A01GP'),
      matchedByMatrix: false
    });
  });

  test('should keep only the matching matrices of a matrix kind matching by matrix', () => {
    expect(
      filterMatrixKinds('mirabelle').find(
        ({ matrixKind }) => matrixKind === 'A01GP'
      )
    ).toStrictEqual({
      matrixKind: 'A01GP',
      matrices: ['A01GS'],
      matchedByMatrix: true
    });
  });

  test('should exclude the matrix kinds matching neither by label nor by matrix', () => {
    expect(filterMatrixKinds('mirabelle')).not.toContainEqual(
      expect.objectContaining({ matrixKind: 'A00QT' })
    );
  });
});
