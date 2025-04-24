import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { getSSD2Id } from 'maestro-shared/referential/Residue/SSD2Referential';
import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import {
  analyseXmlValidator,
  extractAnalyzes,
  girpaCodeEchantillonValidator
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
          "girpaReference": "La référence",
          "notes": "Une note",
          "residues": [],
          "sampleReference": "La-référen",
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
            Substance_active_anglais: 'bixafen',
            Code_méthode: 'M1',
            Date_analyse: '16/04/2025 21:09:28'
          }
        ])
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "girpaReference": "La référence",
          "dateAnalysis": 2025-04-16T19:09:28.000Z,
          "notes": "Une note",
          "residues": [
            {
              "analysisMethod": "Multi",
              "casNumber": "?",
              "codeSandre": null,
              "label": "bixafen",
              "lmr": 10,
              "result": 5.2,
              "result_kind": "Q",
            },
          ],
          "sampleReference": "La-référen",
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
            Substance_active_anglais: 'bixafen',
            Code_méthode: 'M1*',
            Date_analyse: '16/04/2025 21:09:28'
          },
          {
            LMR: 10,
            Limite_de_quantification: '0,9',
            Résultat: '0,29',
            Substance_active_CAS: '27112-32-9',
            Substance_active_anglais: 'fluopyram',
            Code_méthode: 'M3',
            Date_analyse: '16/04/2025 21:09:28'
          },
          {
            LMR: 10,
            Limite_de_quantification: '1',
            Résultat: '10,1',
            Substance_active_CAS: '15299-99-7',
            Substance_active_anglais: 'fluroxypyr',
            Code_méthode: 'M21',
            Date_analyse: '16/04/2025 21:09:28'
          },
          {
            LMR: '-',
            Limite_de_quantification: '1',
            Résultat: '8',
            Substance_active_CAS: '?',
            Substance_active_anglais: 'fluxapyroxad',
            Code_méthode: 'M1',
            Date_analyse: '16/04/2025 21:09:28'
          }
        ])
      )![0].residues
    ).toMatchInlineSnapshot(`
      [
        {
          "analysisMethod": "Multi",
          "casNumber": "1967-25-5",
          "codeSandre": null,
          "label": "bixafen",
          "result_kind": "NQ",
        },
        {
          "analysisMethod": "Mono",
          "casNumber": "27112-32-9",
          "codeSandre": null,
          "label": "fluopyram",
          "result_kind": "ND",
        },
        {
          "analysisMethod": "Mono",
          "casNumber": "15299-99-7",
          "codeSandre": null,
          "label": "fluroxypyr",
          "lmr": 10,
          "result": 10.1,
          "result_kind": "Q",
        },
        {
          "analysisMethod": "Multi",
          "casNumber": "?",
          "codeSandre": null,
          "label": "fluxapyroxad",
          "lmr": 0,
          "result": 8,
          "result_kind": "Q",
        },
      ]
    `);
  });
});

describe('getResidue', () => {
  test.each<[string, string, SSD2Id | null]>([
    ['', 'toto', null],
    ['', 'bixafen', 'RF-1056-001-PPP'],
    ['-', 'metobromuron', 'RF-0791-001-PPP'],
    ['1967-25-5', '4-bromophenylurea', 'RF-00003387-PAR']
  ])('getResidue %#', (casNumber, englishName, expected) => {
    expect(getSSD2Id(englishName, null, casNumber)).toEqual(expected);
  });
});

test.each<[string, string]>([
  ['IDF 75 22 0001 A 01', 'IDF-75-22-0001-A'],
  ['PAC-04-25-0001-A01', 'PAC-04-25-0001-A'],
  ['OCC-25-0007-01', 'OCC-25-0007']
])('girpaCodeEchantillonValidator', (value, expected) => {
  expect(girpaCodeEchantillonValidator.parse(value)).toBe(expected);
});
