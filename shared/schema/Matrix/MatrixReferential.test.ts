import { describe, expect, test } from 'vitest';
import { MatrixReferentialFixture } from '../../test/matrixFixtures';
import {
  effectiveMatrices,
  effectiveMatrixKinds,
  type Matrix,
  type MatrixKind,
  matricesOfKind,
  matrixKindLabel,
  matrixLabel
} from './MatrixReferential';

describe('MatrixReferential', () => {
  test('should fall back to the code when it is unknown', () => {
    expect(matrixLabel(MatrixReferentialFixture, 'UNKNOWN' as Matrix)).toBe(
      'UNKNOWN'
    );
    expect(
      matrixKindLabel(MatrixReferentialFixture, 'UNKNOWN' as MatrixKind)
    ).toBe('UNKNOWN');
  });

  test('should list the matrices of a kind', () => {
    expect(
      matricesOfKind(MatrixReferentialFixture, 'A00GY' as MatrixKind)
    ).toEqual(['A00GZ', 'A00HF']);
    expect(
      matricesOfKind(MatrixReferentialFixture, 'UNKNOWN' as MatrixKind)
    ).toEqual([]);
  });

  test('should list the effective matrix kinds sorted by label', () => {
    const matrixKinds = effectiveMatrixKinds(MatrixReferentialFixture);

    expect(matrixKinds).not.toContain('A0D9Y');
    expect(
      matrixKinds.map((code) => matrixKindLabel(MatrixReferentialFixture, code))
    ).toEqual(
      MatrixReferentialFixture.matrixKinds
        .filter((matrixKind) => !matrixKind.deprecated)
        .map((matrixKind) => matrixKind.label)
        .sort((a, b) => a.localeCompare(b))
    );
  });

  test('should list the effective matrices sorted by label', () => {
    const matrices = effectiveMatrices(MatrixReferentialFixture);

    expect(matrices).not.toContain('A0D9Y');
    expect(
      matrices.map((code) => matrixLabel(MatrixReferentialFixture, code))
    ).toEqual(
      MatrixReferentialFixture.matrices
        .filter((matrix) => !matrix.deprecated)
        .map((matrix) => matrix.label)
        .sort((a, b) => a.localeCompare(b))
    );
  });
});
