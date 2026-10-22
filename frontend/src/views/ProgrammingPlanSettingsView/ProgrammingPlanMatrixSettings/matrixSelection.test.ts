import {
  type Matrix,
  type MatrixKind,
  matricesOfKind
} from 'maestro-shared/schema/Matrix/MatrixReferential';
import { MatrixReferentialFixture } from 'maestro-shared/test/matrixFixtures';
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
          { matrixKind: 'A00QT' as MatrixKind, matrices: [] },
          { matrixKind: 'A01GP' as MatrixKind, matrices: ['A01GS' as Matrix] }
        ],
        'A01GP' as MatrixKind
      )
    ).toStrictEqual([{ matrixKind: 'A00QT', matrices: [] }]);
  });
});

describe('toggleMatrixKind', () => {
  test('should select all the matrices of an unselected matrix kind', () => {
    expect(toggleMatrixKind([], 'A01GP' as MatrixKind)).toStrictEqual([
      { matrixKind: 'A01GP', matrices: [] }
    ]);
  });

  test('should select all the matrices of a partially selected matrix kind', () => {
    expect(
      toggleMatrixKind(
        [
          {
            matrixKind: 'A01GP' as MatrixKind,
            matrices: ['A01GS', 'A0DVG'] as Matrix[]
          },
          { matrixKind: 'A00QT' as MatrixKind, matrices: [] }
        ],
        'A01GP' as MatrixKind
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
          { matrixKind: 'A00QT' as MatrixKind, matrices: [] },
          { matrixKind: 'A01GP' as MatrixKind, matrices: [] }
        ],
        'A01GP' as MatrixKind
      )
    ).toStrictEqual([{ matrixKind: 'A00QT', matrices: [] }]);
  });
});

describe('toggleMatrix', () => {
  test('should add the matrix kind when checking one of its matrices', () => {
    expect(
      toggleMatrix(
        MatrixReferentialFixture,
        [{ matrixKind: 'A00QT' as MatrixKind, matrices: [] }],
        'A01GP' as MatrixKind,
        'A01GS' as Matrix
      )
    ).toStrictEqual([
      { matrixKind: 'A00QT', matrices: [] },
      { matrixKind: 'A01GP', matrices: ['A01GS'] }
    ]);
  });

  test('should keep the matrices sorted by label', () => {
    expect(
      toggleMatrix(
        MatrixReferentialFixture,
        [{ matrixKind: 'A01GP' as MatrixKind, matrices: ['A01GS' as Matrix] }],
        'A01GP' as MatrixKind,
        'A01GQ' as Matrix
      )
    ).toStrictEqual([{ matrixKind: 'A01GP', matrices: ['A01GS', 'A01GQ'] }]);
  });

  test('should detail the other matrices when unchecking a matrix of a fully selected matrix kind', () => {
    expect(
      toggleMatrix(
        MatrixReferentialFixture,
        [{ matrixKind: 'A01GP' as MatrixKind, matrices: [] }],
        'A01GP' as MatrixKind,
        'A01GS' as Matrix
      )
    ).toStrictEqual([
      {
        matrixKind: 'A01GP',
        matrices: subMatrices(
          MatrixReferentialFixture,
          'A01GP' as MatrixKind
        ).filter((matrix) => matrix !== 'A01GS')
      }
    ]);
  });

  test('should select the whole matrix kind when checking its last unchecked matrix', () => {
    expect(
      toggleMatrix(
        MatrixReferentialFixture,
        [
          {
            matrixKind: 'A01GP' as MatrixKind,
            matrices: subMatrices(
              MatrixReferentialFixture,
              'A01GP' as MatrixKind
            ).filter((matrix) => matrix !== 'A01GS')
          }
        ],
        'A01GP' as MatrixKind,
        'A01GS' as Matrix
      )
    ).toStrictEqual([{ matrixKind: 'A01GP', matrices: [] }]);
  });

  test('should remove the matrix kind when unchecking its last checked matrix', () => {
    expect(
      toggleMatrix(
        MatrixReferentialFixture,
        [
          { matrixKind: 'A00QT' as MatrixKind, matrices: [] },
          { matrixKind: 'A01GP' as MatrixKind, matrices: ['A01GS' as Matrix] }
        ],
        'A01GP' as MatrixKind,
        'A01GS' as Matrix
      )
    ).toStrictEqual([{ matrixKind: 'A00QT', matrices: [] }]);
  });
});

describe('subMatrices', () => {
  test('should list the matrices of the matrix kind sorted by label', () => {
    expect(
      subMatrices(MatrixReferentialFixture, 'A00QT' as MatrixKind)
    ).toStrictEqual(['A00QY', 'A0DNJ', 'A0DNK', 'A00QV', 'A00QX', 'A00QZ']);
  });

  test('should exclude the matrix kind itself', () => {
    expect(
      subMatrices(MatrixReferentialFixture, 'A00RT' as MatrixKind)
    ).toStrictEqual([]);
    expect(
      subMatrices(MatrixReferentialFixture, 'A001M' as MatrixKind)
    ).not.toContain('A001M');
    expect(
      subMatrices(MatrixReferentialFixture, 'A001M' as MatrixKind)
    ).toHaveLength(
      matricesOfKind(MatrixReferentialFixture, 'A001M' as MatrixKind).length - 1
    );
  });
});

describe('filterMatrixKinds', () => {
  test('should list every matrix kind sorted by label without search', () => {
    const options = filterMatrixKinds(MatrixReferentialFixture, '');
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
      matrices: subMatrices(MatrixReferentialFixture, 'A01GP' as MatrixKind),
      matchedByMatrix: false
    });
  });

  test('should keep all matrices of a matrix kind matching by label', () => {
    expect(
      filterMatrixKinds(MatrixReferentialFixture, '  PRUNES et ').find(
        ({ matrixKind }) => matrixKind === 'A01GP'
      )
    ).toStrictEqual({
      matrixKind: 'A01GP',
      matrices: subMatrices(MatrixReferentialFixture, 'A01GP' as MatrixKind),
      matchedByMatrix: false
    });
  });

  test('should ignore accents and case', () => {
    expect(
      filterMatrixKinds(MatrixReferentialFixture, 'AULX ET ECHALOTES').find(
        ({ matrixKind }) => matrixKind === 'A00GY'
      )
    ).toStrictEqual({
      matrixKind: 'A00GY',
      matrices: subMatrices(MatrixReferentialFixture, 'A00GY' as MatrixKind),
      matchedByMatrix: false
    });
  });

  test('should keep only the matching matrices of a matrix kind matching by matrix', () => {
    expect(
      filterMatrixKinds(MatrixReferentialFixture, 'mirabelle').find(
        ({ matrixKind }) => matrixKind === 'A01GP'
      )
    ).toStrictEqual({
      matrixKind: 'A01GP',
      matrices: ['A01GS'],
      matchedByMatrix: true
    });
  });

  test('should exclude the matrix kinds matching neither by label nor by matrix', () => {
    expect(
      filterMatrixKinds(MatrixReferentialFixture, 'mirabelle')
    ).not.toContainEqual(expect.objectContaining({ matrixKind: 'A00QT' }));
  });
});
