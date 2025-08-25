import { describe, expect, test } from 'vitest';
import { extractAnalyzes } from './capinov';

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
      LOT: '1',
      PARAMETRE_NOM: 'SAP00010',
      RESULTAT_VALTEXTE: 'nd',
      RESULTAT_VALNUM: '0',
      PARAMETRE_LIBELLE: 'Acephate',
      LIMITE_LQ: '0.01',
      INCERTITUDE: '0',
      CAS_NUMBER: '135158-54-2',
      TECHNIQUE: 'MI MO-PC-077',
      LMR_NUM: '0.01'
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

  test("la méthode d'analyse d'un calcul est récupérée sur le résidu précédent", () => {
    const defaultLine = {
      LOT: 'ARA-1234-333-1',
      PARAMETRE_NOM: 'SAP00010',
      RESULTAT_VALTEXTE: 'nd',
      RESULTAT_VALNUM: '0',
      PARAMETRE_LIBELLE: 'Acephate',
      LIMITE_LQ: '0.01',
      INCERTITUDE: '0',
      CAS_NUMBER: '135158-54-2',
      TECHNIQUE: 'MI MO-PC-077',
      LMR_NUM: '0,01'
    };

    const lines = [
      { ...defaultLine, TECHNIQUE: 'MI GC-MS/MS' },
      { ...defaultLine, TECHNIQUE: 'Calcul' },
      { ...defaultLine, TECHNIQUE: 'MI HPLC/UV' },
      { ...defaultLine, TECHNIQUE: 'Calcul' }
    ];

    expect(extractAnalyzes(lines)).toMatchInlineSnapshot(`
      [
        {
          "notes": "",
          "residues": [
            {
              "analysisDate": null,
              "analysisMethod": "Multi",
              "casNumber": "135158-54-2",
              "codeSandre": null,
              "label": "Acephate",
              "result_kind": "ND",
            },
            {
              "analysisDate": null,
              "analysisMethod": "Multi",
              "casNumber": "135158-54-2",
              "codeSandre": null,
              "label": "Acephate",
              "result_kind": "ND",
            },
            {
              "analysisDate": null,
              "analysisMethod": "Mono",
              "casNumber": "135158-54-2",
              "codeSandre": null,
              "label": "Acephate",
              "result_kind": "ND",
            },
            {
              "analysisDate": null,
              "analysisMethod": "Mono",
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
});
