import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import {
  analyseXmlValidator,
  extractAnalyzes,
   girpaConf,
} from './girpa';
import { getSSD2Id } from 'maestro-shared/referential/Residue/SSD2Referential';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';

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
              "reference": "RF-1056-001-PPP",
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
          "reference": "RF-00003387-PAR",
          "result": 0.3,
          "result_kind": "Q",
        },
        {
          "lmr": 10,
          "reference": "RF-0215-003-PPP",
          "result": 10.1,
          "result_kind": "Q",
        },
        {
          "lmr": null,
          "reference": "RF-00000024-PAR",
          "result": null,
          "result_kind": "NQ",
        },
      ]
    `);
  });
});

describe('getResidue', () => {
  test.each<[string, string, SSD2Id | null]>([
    ['', 'toto', null],
    ['', 'bixafen','RF-1056-001-PPP'],
    [
      '',
      'bixafen according reg.',
      'RF-1056-001-PPP'
    ],
    [
      '120983-64-4',
      'prothioconazole: prothioconazole-desthio',
      'RF-0868-001-PPP'
    ],
    [
      '-',
      'metobromuron according reg.',
      'RF-0791-001-PPP'
    ],
    [
      '-',
      'metobromuron',
      'RF-0791-001-PPP'
    ],
    [
      '15299-99-7',
      'napropamide according reg.',
      'RF-00012802-PAR'
    ],
      [
      '1967-25-5',
        '4-bromophenylurea',
        'RF-00003387-PAR'
      ]
  ])('getResidue %#', (casNumber, englishName, expected) => {
    expect(
      getSSD2Id(
        englishName,
        null,
        casNumber,
        girpaConf.ssd2IdByLabel
      )
    ).toEqual(expected);
  });
});
