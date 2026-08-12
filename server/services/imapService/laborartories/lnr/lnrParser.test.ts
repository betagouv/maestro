import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { RESIDUE_MAPPINGS } from '../../../../database/migrations/109-lnr-residue-mappings';
import { ExtractLabError } from '../../extractError';
import { parseLnrReport } from './lnrParser';

// fake fixture
const report = readFileSync(
  path.join(import.meta.dirname, './test/report.fixture.txt'),
  'utf8'
);

describe('parseLnrReport', () => {
  test('extrait les métadonnées du rapport', () => {
    const result = parseLnrReport(report);

    expect(result).toMatchObject({
      sampleReference: 'EXA-26-00042',
      itemNumber: 1,
      copyNumber: 1,
      receiptDate: '2026-04-08',
      notes: 'Sans objet'
    });
  });

  test('extrait les 42 résidus du panel', () => {
    const { residues } = parseLnrReport(report);

    expect(residues).toHaveLength(42);
    // « < LQ » vaut « non détecté », pas « détecté non quantifié »
    expect(residues.every((r) => r.result_kind === 'ND')).toBe(true);
    expect(residues.every((r) => r.analysisDate === '2026-05-21')).toBe(true);
    expect(
      residues.every(
        (r) =>
          r.preciseMethod ===
          'Méthode Anses LSA-INS-1461 – Pesticides dans le foie par GC-MS/MS (QuECHERS)'
      )
    ).toBe(true);

    expect(residues[0]).toMatchObject({
      label: 'ALDRINE',
      result_kind: 'ND',
      lq: 0.005,
      analysisMethod: 'Multi',
      casNumber: null,
      codeSandre: null
    });
  });

  test('recolle les libellés étalés sur plusieurs lignes', () => {
    const labels = parseLnrReport(report).residues.map((r) => r.label);

    expect(labels).toContain(
      'ALDRINE & DIELDRINE (Somme de Aldrine et dieldrine, exprimée en dieldrine)'
    );
    // Libellé si long que les valeurs sont rejetées sur une ligne à part.
    expect(labels).toContain(
      'ENDOSULFAN (Somme de alpha- et beta- isomères et endosulfan-sulfate, exprimée en endosulfan)'
    );
  });

  test('distingue le résidu simple de la somme qui porte le même préfixe', () => {
    const labels = parseLnrReport(report).residues.map((r) => r.label);

    expect(labels).toContain('HEPTACHLORE');
    expect(labels).toContain(
      'HEPTACHLORE (Somme de heptachlore et heptachlore-epoxide, exprimée en heptachlore)'
    );
  });

  test('produit exactement les libellés figés dans la migration', () => {
    const parsed = parseLnrReport(report).residues.map((r) => r.label);

    expect(parsed.toSorted()).toEqual(
      RESIDUE_MAPPINGS.map(([label]) => label).toSorted()
    );
  });

  test('lit un résultat quantifié avec sa LMR', () => {
    const quantified = report.replace(
      'ALDRINE < LQ 0,005 50 % -',
      'ALDRINE 0,012 0,005 50 % 0,05'
    );

    expect(parseLnrReport(quantified).residues[0]).toMatchObject({
      label: 'ALDRINE',
      result_kind: 'Q',
      result: 0.012,
      lmr: 0.05,
      lq: 0.005
    });
  });

  test('accepte le format de date à 2 chiffres comme à 4 chiffres', () => {
    const fourDigits = report.replace(
      "Date de début d'analyse : 21/05/26",
      "Date de début d'analyse : 21/05/2026"
    );

    expect(parseLnrReport(fourDigits).residues[0].analysisDate).toBe(
      '2026-05-21'
    );
  });

  describe('échoue explicitement', () => {
    test('sur une référence échantillon absente', () => {
      const withoutReference = report.replace(
        'Référence Echantillon Client : EXA-26-00042-A-1',
        ''
      );

      expect(() => parseLnrReport(withoutReference)).toThrow(
        /Référence Echantillon Client/
      );
    });

    test('sur une unité de mesure inattendue', () => {
      const otherUnit = report.replace(
        'Unité de mesure : mg/kg de produit',
        'Unité de mesure : µg/kg de produit'
      );

      expect(() => parseLnrReport(otherUnit)).toThrow(
        /Unité de mesure inattendue/
      );
    });

    test('sur une incertitude différente de 50 %', () => {
      const otherUncertainty = report.replace(
        'ALDRINE < LQ 0,005 50 % -',
        'ALDRINE < LQ 0,005 30 % -'
      );

      expect(() => parseLnrReport(otherUncertainty)).toThrow(
        /Incertitude inattendue pour ALDRINE : 30 %/
      );
    });

    test('sur une valeur sous la LQ chiffrée, dont le sens reste à confirmer', () => {
      const belowValue = report.replace(
        'ALDRINE < LQ 0,005 50 % -',
        'ALDRINE < 0,005 0,005 50 % -'
      );

      expect(belowValue).not.toBe(report);
      expect(() => parseLnrReport(belowValue)).toThrow(
        /Résultat non reconnu.*ALDRINE < 0,005/
      );
    });

    test('sur un résultat de forme inconnue, en citant la ligne', () => {
      const unknownResult = report.replace(
        'ALDRINE < LQ 0,005 50 % -',
        'ALDRINE TRACES 0,005 50 % -'
      );

      expect(() => parseLnrReport(unknownResult)).toThrow(ExtractLabError);
      expect(() => parseLnrReport(unknownResult)).toThrow(
        /Résultat non reconnu.*ALDRINE TRACES/
      );
    });

    test('sur une date invalide', () => {
      const badDate = report.replace(
        "Date de début d'analyse : 21/05/26",
        "Date de début d'analyse : 32/13/26"
      );

      expect(() => parseLnrReport(badDate)).toThrow(/Date .* invalide/);
    });
  });
});
