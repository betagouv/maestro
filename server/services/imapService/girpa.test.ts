import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import {
  analyseXmlValidator,
  extractAnalyzes,
  getResidue,
  residueCasNumberValidator,
  residueEnglishNameValidator
} from './girpa';

const girpaXMLExample = (analyses: z.input<typeof analyseXmlValidator>[]) => ({
  Rapport: {
    Echantillon: {
      Date_réception_échantillons: '01/09/2024',
      Code_échantillon: 'La référence',
      Nature_matrice: 'ORGE',
      Commentaire: 'Une note',
      Analyse: analyses
    }
  }
});
describe('parse correctement le XML', () => {
  test("un xml avec un tableau d'echantillons", () => {
    expect(
      extractAnalyzes({
        Rapport: {
          Echantillon: [
            {
              Date_réception_échantillons: '01/09/2024',
              Code_échantillon: 'La référence',
              Nature_matrice: 'ORGE',
              Commentaire: 'Une note',
              Analyse: []
            }
          ]
        }
      })
    ).toMatchInlineSnapshot(`
      [
        {
          "notes": "Une note",
          "residues": [],
          "sampleReference": "La référence",
        },
      ]
    `);
  });

  test('un xml avec 1 echantillon', () => {
    expect(
      extractAnalyzes(
        girpaXMLExample([
          {
            LMR: 10,
            Limite_de_quantification: '1,1',
            Résultat: '5,2',
            Substance_active_CAS: '?',
            Substance_active_anglais: 'bixafen'
          }
        ])
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "notes": "Une note",
          "residues": [
            {
              "lmr": 10,
              "residue": {
                "kind": "SimpleResidue",
                "reference": "RF-1056-001-PPP",
              },
              "result": 5.2,
              "result_kind": "Q",
            },
          ],
          "sampleReference": "La référence",
        },
      ]
    `);
  });

  test('extrait que les substances intéressantes', () => {
    expect(
      extractAnalyzes(
        girpaXMLExample([
          {
            LMR: 10,
            Limite_de_quantification: '0,9',
            Résultat: '0,3',
            Substance_active_CAS: '1967-25-5',
            Substance_active_anglais: 'bixafen'
          },
          {
            LMR: 10,
            Limite_de_quantification: '0,9',
            Résultat: '0,29',
            Substance_active_CAS: '27112-32-9',
            Substance_active_anglais: 'fluopyram'
          },
          {
            LMR: 10,
            Limite_de_quantification: '1',
            Résultat: '10,1',
            Substance_active_CAS: '15299-99-7',
            Substance_active_anglais: 'fluroxypyr'
          },
          {
            LMR: '-',
            Limite_de_quantification: '1',
            Résultat: '8',
            Substance_active_CAS: '?',
            Substance_active_anglais: 'fluxapyroxad'
          }
        ])
      )![0].residues
    ).toMatchInlineSnapshot(`
      [
        {
          "lmr": 10,
          "residue": {
            "kind": "SimpleResidue",
            "reference": "RF-1056-001-PPP",
          },
          "result": 0.3,
          "result_kind": "Q",
        },
        {
          "lmr": 10,
          "residue": {
            "kind": "Analyte",
            "reference": "RF-0215-003-PPP",
          },
          "result": 10.1,
          "result_kind": "Q",
        },
        {
          "lmr": null,
          "residue": {
            "kind": "SimpleResidue",
            "reference": "RF-00000024-PAR",
          },
          "result": null,
          "result_kind": "NQ",
        },
      ]
    `);
  });
});

describe('getResidue', () => {
  test.each<[string, string, ReturnType<typeof getResidue>]>([
    ['', 'toto', null],
    ['', 'bixafen', { reference: 'RF-1056-001-PPP', kind: 'SimpleResidue' }],
    [
      '',
      'bixafen according reg.',
      { reference: 'RF-1056-001-PPP', kind: 'SimpleResidue' }
    ],
    [
      '120983-64-4',
      'prothioconazole: prothioconazole-desthio',
      { reference: 'RF-0868-001-PPP', kind: 'SimpleResidue' }
    ],
    [
      '-',
      'metobromuron according reg.',
      { reference: 'RF-00014532-PAR', kind: 'SimpleResidue' }
    ],
    [
      '-',
      'metobromuron',
      { reference: 'RF-00014532-PAR', kind: 'SimpleResidue' }
    ],
    [
      '15299-99-7',
      'napropamide according reg.',
      { reference: 'RF-00012802-PAR', kind: 'SimpleResidue' }
    ]
    //TODO AUTO_LABO en attente de plus d'infos sur les référentiels
    //Résidu non trouvé: 1967-25-5 4-bromophenylurea
    // Résidu non trouvé: 27112-32-9 desmethyl-metobromuron
  ])('getResidue %#', (casNumber, englishName, expected) => {
    expect(
      getResidue(
        casNumber as z.infer<typeof residueCasNumberValidator>,
        englishName as z.infer<typeof residueEnglishNameValidator>
      )
    ).toEqual(expected);
  });
});
