import { describe, expect, test } from 'vitest';
import {
  capinovCodeEchantillonValidator,
  extractAnalyzes,
  getAnalysisKeyByFileName
} from './capinov';

describe('Parse correctement le fichier CSV', () => {
  test('émet une erreur si le fichier est incorrect ou vide', () => {
    expect(() => extractAnalyzes([])).toThrowErrorMatchingInlineSnapshot(
      `[Error: Aucune donnée trouvée dans le fichier de résultats]`
    );
    expect(() =>
      extractAnalyzes([{ unknownProps: 'unknownValue' }])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Aucune donnée trouvée dans le fichier de résultats]`
    );
    expect(() =>
      extractAnalyzes([{ LOT: 'test', unknownProps: 'unknownValue' }])
    ).toThrowError();
  });

  test("n'émet pas d'erreur si le fichier est correct", () => {
    const line = {
      PREFIXE_NOM: '2025',
      DEMANDE_NUMERO: '0003',
      ECHANT_NUMERO: '1',
      LOT: '1',
      PARAMETRE_NOM: 'SAP00010',
      RESULTAT_VALTEXTE: 'nd',
      RESULTAT_VALNUM: '0',
      PARAMETRE_LIBELLE: 'Acephate',
      LIMITE_LQ: '0.01',
      INCERTITUDE: '0',
      CAS_NUMBER: '135158-54-2',
      TECHNIQUE: 'Mono',
      LMR_NUM: '0.01',
      ECHANT_DATE_DIFFUSION: '16/04/2025'
    };
    expect(() => extractAnalyzes([line])).not.toThrowError();
    expect(() =>
      extractAnalyzes([{ ...line, RESULTAT_VALTEXTE: '0.0004' }])
    ).not.toThrowError();
    expect(() =>
      extractAnalyzes([{ ...line, LIMITE_LQ: '' }])
    ).not.toThrowError();
    expect(() =>
      extractAnalyzes([{ ...line, INCERTITUDE: '' }])
    ).not.toThrowError();
    expect(() =>
      extractAnalyzes([{ ...line, LMR_NUM: '' }])
    ).not.toThrowError();
  });
});

test('<LQ et "d, NQ" sont équivalent', () => {
  const defaultLine = {
    PREFIXE_NOM: '2025',
    DEMANDE_NUMERO: '0003',
    ECHANT_NUMERO: '1',
    LOT: 'ARA-1234-333-1',
    PARAMETRE_NOM: 'SAP00010',
    RESULTAT_VALTEXTE: 'nd',
    RESULTAT_VALNUM: '0',
    PARAMETRE_LIBELLE: 'Acephate',
    LIMITE_LQ: '0.01',
    INCERTITUDE: '0',
    CAS_NUMBER: '135158-54-2',
    TECHNIQUE: 'Multi',
    LMR_NUM: '0,01',
    ECHANT_DATE_DIFFUSION: '16/04/2025',
    COMMENTAIRE: 'Pas de problème'
  };

  const lines = [
    { ...defaultLine, RESULTAT_VALTEXTE: 'd, NQ' },
    { ...defaultLine, RESULTAT_VALTEXTE: '< LQ' }
  ];
  expect(extractAnalyzes(lines)).toMatchInlineSnapshot(`
    [
      {
        "capinovRef": "2025 0003 1",
        "notes": "Pas de problème",
        "residues": [
          {
            "analysisDate": "2025-04-16",
            "analysisMethod": "Multi",
            "casNumber": "135158-54-2",
            "codeSandre": null,
            "label": "Acephate",
            "result_kind": "NQ",
          },
          {
            "analysisDate": "2025-04-16",
            "analysisMethod": "Multi",
            "casNumber": "135158-54-2",
            "codeSandre": null,
            "label": "Acephate",
            "result_kind": "NQ",
          },
        ],
        "sampleReference": "ARA-1234-333",
      },
    ]
  `);
});

test('récupère la LMR dans l autre colonne si besoin', () => {
  const line = {
    PREFIXE_NOM: '2025',
    DEMANDE_NUMERO: '0003',
    ECHANT_NUMERO: '1',
    LOT: 'ARA-1234-333-1',
    PARAMETRE_NOM: 'SAP00010',
    RESULTAT_VALTEXTE: '0,5',
    RESULTAT_VALNUM: '0.5',
    PARAMETRE_LIBELLE: 'Acephate',
    LIMITE_LQ: '0.01',
    INCERTITUDE: '0',
    CAS_NUMBER: '135158-54-2',
    TECHNIQUE: 'Multi',
    LMR_NUM: '0',
    LMR: '0.5*',
    ECHANT_DATE_DIFFUSION: '16/04/2025',
    COMMENTAIRE: 'Pas de problème'
  };

  expect(extractAnalyzes([line])).toMatchInlineSnapshot(`
    [
      {
        "capinovRef": "2025 0003 1",
        "notes": "Pas de problème",
        "residues": [
          {
            "analysisDate": "2025-04-16",
            "analysisMethod": "Multi",
            "casNumber": "135158-54-2",
            "codeSandre": null,
            "label": "Acephate",
            "lmr": 0.5,
            "result": 0.5,
            "result_kind": "Q",
          },
        ],
        "sampleReference": "ARA-1234-333",
      },
    ]
  `);
});

test('considère <LQ pour les calculs en ND', () => {
  const defaultLine = {
    PREFIXE_NOM: '2025',
    DEMANDE_NUMERO: '0003',
    ECHANT_NUMERO: '1',
    LOT: 'ARA-1234-333-1',
    PARAMETRE_NOM: 'SAP00010_S',
    RESULTAT_VALTEXTE: '< LQ',
    RESULTAT_VALNUM: '0',
    PARAMETRE_LIBELLE: 'Acephate',
    LIMITE_LQ: '0.01',
    INCERTITUDE: '0',
    CAS_NUMBER: '135158-54-2',
    TECHNIQUE: 'Multi',
    LMR_NUM: '0,01',
    ECHANT_DATE_DIFFUSION: '16/04/2025',
    COMMENTAIRE: 'Pas de problème'
  };

  expect(extractAnalyzes([defaultLine])).toMatchInlineSnapshot(`
    [
      {
        "capinovRef": "2025 0003 1",
        "notes": "Pas de problème",
        "residues": [
          {
            "analysisDate": "2025-04-16",
            "analysisMethod": "Multi",
            "casNumber": "135158-54-2",
            "codeSandre": null,
            "label": "Acephate",
            "result_kind": "ND",
          },
        ],
        "sampleReference": "ARA-1234-333",
      },
    ]
  `);
});

test('getAnalysisKeyByFileName', () => {
  expect(
    getAnalysisKeyByFileName(
      'Capinov_Export_MAESTRO 2025_6.8603.1 20250901.csv'
    )
  ).toMatchInlineSnapshot(`"2025_6.8603.1"`);
  expect(
    getAnalysisKeyByFileName(
      'Capinov_Export_MAESTRO 2025_6.8603.1 20250901.csv'
    )
  ).toBe(getAnalysisKeyByFileName('2025_6 8603 1  asenasen asen asne.pdf'));
});

test.each<[string, string]>([
  ['OCC-25-0007-01', 'OCC-25-0007'],
  ['OCC-25-0007', 'OCC-25-0007'],
  ['OCC - 25-0007', 'OCC-25-0007']
])('capinovCodeEchantillonValidator', (value, expected) => {
  expect(capinovCodeEchantillonValidator.parse(value)).toBe(expected);
});
