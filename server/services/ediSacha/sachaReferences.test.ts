import { describe, expect, test } from 'vitest';
import {
  NumeroEtiquette,
  referencesFromEtiquette,
  referencesFromSample,
  SampleReference
} from './sachaReferences';

const dateMay20_2026 = Date.UTC(2026, 4, 20, 12, 0, 0);

describe('referencesFromSample', () => {
  test('encode une référence', () => {
    const { numeroDAP, numeroEtiquette } = referencesFromSample(
      SampleReference.parse('ARA-26-00073'),
      dateMay20_2026,
      2
    );
    expect(numeroDAP).toBe('666626000073');
    expect(numeroEtiquette).toBe(
      `02${'666626000073'}${'2026'}${'140'}${'002'}`
    );
  });

  test('ne dépend pas de la région', () => {
    const { numeroDAP } = referencesFromSample(
      SampleReference.parse('GUA-26-12345'),
      dateMay20_2026,
      1
    );
    expect(numeroDAP).toBe('666626012345');
  });

  test('rejette une référence au format pré-2026 (sérial 4 digits)', () => {
    expect(() => SampleReference.parse('ARA-25-1234')).toThrow();
  });
});

describe('referencesFromEtiquette', () => {
  test('décode le numéro DAP, l’année et le serial de la référence', () => {
    const { numeroEtiquette } = referencesFromSample(
      SampleReference.parse('ARA-26-00073'),
      dateMay20_2026,
      2
    );
    expect(referencesFromEtiquette(numeroEtiquette)).toEqual({
      numeroDAP: '666626000073',
      referenceSuffix: '26-00073',
      itemNumber: 2,
      year: 2026,
      dayOfYear: 140
    });
  });

  test('décode un serial à 5 chiffres', () => {
    const { numeroEtiquette } = referencesFromSample(
      SampleReference.parse('IDF-26-99999'),
      dateMay20_2026,
      26
    );
    const decoded = referencesFromEtiquette(numeroEtiquette);
    expect(decoded.referenceSuffix).toBe('26-99999');
    expect(decoded.itemNumber).toBe(26);
  });

  test('rejette un numéro DAP sans le préfixe 6666', () => {
    expect(() =>
      referencesFromEtiquette(NumeroEtiquette.parse('022026840000732026140002'))
    ).toThrow();
  });

  test('rejette une étiquette au format invalide', () => {
    expect(() => NumeroEtiquette.parse('not-an-etiquette')).toThrow();
  });
});
