import {
  type MatrixKind,
  matricesOfKind
} from 'maestro-shared/schema/Matrix/MatrixReferential';
import { MatrixReferentialFixture } from 'maestro-shared/test/matrixFixtures';
import { filterParents } from 'src/components/_app/AppHierarchicalSelection/hierarchicalSelection';
import { describe, expect, test } from 'vitest';
import { matrixHierarchy, subMatrices } from './matrixSelection';

const hierarchy = matrixHierarchy(MatrixReferentialFixture);

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

describe('matrixHierarchy', () => {
  test('should list every matrix kind sorted by label without search', () => {
    const options = filterParents(hierarchy, '');
    const prunesIndex = options.findIndex(({ parent }) => parent === 'A01GP');
    const radisIndex = options.findIndex(({ parent }) => parent === 'A00QT');

    expect(prunesIndex).toBeGreaterThanOrEqual(0);
    expect(prunesIndex).toBeLessThan(radisIndex);
    expect(options[prunesIndex]).toStrictEqual({
      parent: 'A01GP',
      children: subMatrices(MatrixReferentialFixture, 'A01GP' as MatrixKind),
      matchedByChild: false
    });
  });

  test('should keep all matrices of a matrix kind matching by label', () => {
    expect(
      filterParents(hierarchy, '  PRUNES et ').find(
        ({ parent }) => parent === 'A01GP'
      )
    ).toStrictEqual({
      parent: 'A01GP',
      children: subMatrices(MatrixReferentialFixture, 'A01GP' as MatrixKind),
      matchedByChild: false
    });
  });

  test('should ignore accents and case', () => {
    expect(
      filterParents(hierarchy, 'AULX ET ECHALOTES').find(
        ({ parent }) => parent === 'A00GY'
      )
    ).toStrictEqual({
      parent: 'A00GY',
      children: subMatrices(MatrixReferentialFixture, 'A00GY' as MatrixKind),
      matchedByChild: false
    });
  });

  test('should keep only the matching matrices of a matrix kind matching by matrix', () => {
    expect(
      filterParents(hierarchy, 'mirabelle').find(
        ({ parent }) => parent === 'A01GP'
      )
    ).toStrictEqual({
      parent: 'A01GP',
      children: ['A01GS'],
      matchedByChild: true
    });
  });

  test('should exclude the matrix kinds matching neither by label nor by matrix', () => {
    expect(filterParents(hierarchy, 'mirabelle')).not.toContainEqual(
      expect.objectContaining({ parent: 'A00QT' })
    );
  });
});
