import { describe, expect, test } from 'vitest';
import { MatrixReferentialFixture } from '../../test/matrixFixtures';
import { sampleProcedureItems } from './SampleProcedure';

describe('sampleProcedureItems', () => {
  const sampleProcedure = {
    unitCount: null,
    minQuantity: '200 grammes',
    container: 'Contenant en plastique',
    samplingTemperature: '',
    storageTemperature: '-18°',
    maxAnalysisDelay: null
  };

  test('liste les champs renseignés dans l’ordre du formulaire', () => {
    expect(
      sampleProcedureItems(MatrixReferentialFixture, sampleProcedure, null)
    ).toStrictEqual([
      { label: 'Quantité minimale', value: '200 grammes' },
      { label: 'Contenant', value: 'Contenant en plastique' },
      { label: 'T° de conservation', value: '-18°' }
    ]);
  });

  test('commence par la matière prélevée quand le prélèvement a des matrices', () => {
    expect(
      sampleProcedureItems(MatrixReferentialFixture, null, [
        { matrixKind: 'Other', matrix: 'Foie' },
        { matrixKind: 'Other', matrix: 'Rein' },
        { matrixKind: null, matrix: null }
      ])
    ).toStrictEqual([{ label: 'Matière prélevée', value: 'Foie, Rein' }]);
  });

  test('ne rend rien sans modalités ni matrice', () => {
    expect(
      sampleProcedureItems(MatrixReferentialFixture, null, [])
    ).toStrictEqual([]);
  });
});
