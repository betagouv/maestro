import type {
  Matrix,
  MatrixKind
} from 'maestro-shared/schema/Matrix/MatrixReferential';
import { MatrixReferentialFixture } from 'maestro-shared/test/matrixFixtures';
import { genSubPlanMatrices } from 'maestro-shared/test/programmingPlanFixtures';
import { describe, expect, test } from 'vitest';
import {
  hasUnknownSampleMatrixCodes,
  hasUnknownSubPlanMatrixCodes
} from './matrixService';

describe('hasUnknownSampleMatrixCodes', () => {
  test('accepte des codes du référentiel, une saisie incomplète et le texte libre de « Autre »', () => {
    expect(
      hasUnknownSampleMatrixCodes(MatrixReferentialFixture, [
        { matrixKind: 'A00GY' as MatrixKind, matrix: 'A00GZ' },
        { matrixKind: 'A00QT' as MatrixKind, matrix: null },
        { matrixKind: 'Other', matrix: 'Navet' }
      ])
    ).toBe(false);
  });

  test('accepte une matrice d’une autre catégorie du référentiel', () => {
    expect(
      hasUnknownSampleMatrixCodes(MatrixReferentialFixture, [
        { matrixKind: 'A00GY' as MatrixKind, matrix: 'A01GS' }
      ])
    ).toBe(false);
  });

  test('refuse une catégorie inconnue', () => {
    expect(
      hasUnknownSampleMatrixCodes(MatrixReferentialFixture, [
        { matrixKind: 'UNKNOWN' as MatrixKind, matrix: null }
      ])
    ).toBe(true);
  });

  test('refuse une matrice inconnue', () => {
    expect(
      hasUnknownSampleMatrixCodes(MatrixReferentialFixture, [
        { matrixKind: 'A00GY' as MatrixKind, matrix: 'Navet' }
      ])
    ).toBe(true);
  });
});

describe('hasUnknownSubPlanMatrixCodes', () => {
  test('accepte des codes du référentiel et l’absence de matrices', () => {
    expect(
      hasUnknownSubPlanMatrixCodes(
        MatrixReferentialFixture,
        genSubPlanMatrices('A01GP' as MatrixKind, ['A01GS'] as Matrix[])
      )
    ).toBe(false);
    expect(hasUnknownSubPlanMatrixCodes(MatrixReferentialFixture, null)).toBe(
      false
    );
  });

  test('refuse une catégorie inconnue', () => {
    expect(
      hasUnknownSubPlanMatrixCodes(
        MatrixReferentialFixture,
        genSubPlanMatrices('UNKNOWN' as MatrixKind)
      )
    ).toBe(true);
  });

  test('refuse une matrice inconnue', () => {
    expect(
      hasUnknownSubPlanMatrixCodes(
        MatrixReferentialFixture,
        genSubPlanMatrices('A01GP' as MatrixKind, ['UNKNOWN'] as Matrix[])
      )
    ).toBe(true);
  });
});
