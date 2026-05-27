import { describe, expect, test } from 'vitest';
import {
  NumeroEtiquette,
  referencesFromEtiquette,
  referencesFromSample,
  SampleReference
} from './sachaReferences';

// 20 mai 2026 12:00 UTC → 20 mai à Paris (j140)
const dateMay20_2026 = Date.UTC(2026, 4, 20, 12, 0, 0);

describe('referencesFromSample', () => {
  test('encode une référence sur le 1er jour', () => {
    const { numeroDAP, numeroEtiquette } = referencesFromSample(
      SampleReference.parse('ARA-26-00073'),
      dateMay20_2026,
      2
    );
    expect(numeroDAP).toBe('202684000073');
    expect(numeroEtiquette).toBe(
      `02${'202684000073'}${'2026'}${'140'}${'002'}`
    );
  });
  test('encode une référence ARA (region 84)', () => {
    const { numeroDAP, numeroEtiquette } = referencesFromSample(
      SampleReference.parse('ARA-26-00073'),
      dateMay20_2026,
      2
    );
    expect(numeroDAP).toBe('202684000073');
    expect(numeroEtiquette).toBe(
      `02${'202684000073'}${'2026'}${'140'}${'002'}`
    );
  });

  test('préserve le zéro de tête du code région (GUA = 01)', () => {
    const { numeroDAP } = referencesFromSample(
      SampleReference.parse('GUA-26-12345'),
      dateMay20_2026,
      1
    );
    expect(numeroDAP).toBe('202601012345');
    expect(numeroDAP).toHaveLength(12);
  });

  test('lève si le préfixe régional est inconnu', () => {
    expect(() =>
      referencesFromSample(
        SampleReference.parse('XYZ-26-00073'),
        dateMay20_2026,
        1
      )
    ).toThrow();
  });

  test('rejette une référence au format pré-2026 (sérial 4 digits)', () => {
    expect(() => SampleReference.parse('ARA-25-1234')).toThrow();
  });
});

describe('referencesFromEtiquette', () => {
  test('round-trip ARA', () => {
    const original = SampleReference.parse('ARA-26-00073');
    const { numeroEtiquette } = referencesFromSample(
      original,
      dateMay20_2026,
      2
    );
    const decoded = referencesFromEtiquette(numeroEtiquette);
    expect(decoded.reference).toBe(original);
    expect(decoded.itemNumber).toBe(2);
    expect(decoded.year).toBe(2026);
    expect(decoded.dayOfYear).toBe(140);
  });

  test('round-trip MYT (region 06, zéro de tête)', () => {
    const original = SampleReference.parse('MYT-26-00001');
    const { numeroEtiquette } = referencesFromSample(
      original,
      dateMay20_2026,
      5
    );
    const decoded = referencesFromEtiquette(numeroEtiquette);
    expect(decoded.reference).toBe(original);
    expect(decoded.numeroDAP).toBe('202606000001');
  });

  test('round-trip IDF (region 11)', () => {
    const original = SampleReference.parse('IDF-26-99999');
    const { numeroEtiquette } = referencesFromSample(
      original,
      dateMay20_2026,
      26
    );
    const decoded = referencesFromEtiquette(numeroEtiquette);
    expect(decoded.reference).toBe(original);
    expect(decoded.itemNumber).toBe(26);
  });

  test('rejette une étiquette au format invalide', () => {
    expect(() => NumeroEtiquette.parse('not-an-etiquette')).toThrow();
  });
});
