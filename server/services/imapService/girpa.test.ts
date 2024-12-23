import { describe, expect, test } from 'vitest';
import {
  analyseXmlValidator,
  extractSample,
  getResidue,
  residueCasNumberValidator,
  residueEnglishNameValidator
} from './girpa';
import { z } from 'zod';

const girpaXMLExample = (analyses: z.input<typeof analyseXmlValidator>[]) => ({
  Rapport: {
    Echantillon: {
      'Date_réception_échantillons': '01/09/2024',
      'Code_échantillon': 'La référence',
      Nature_matrice: 'ORGE',
      Commentaire: 'Une note',
      Analyse: analyses
    }
  }
});
describe('parse correctement le XML', () => {
  test('un xml avec un tableau d\'echantillons', () => {
    expect(extractSample({
      Rapport: {
        Echantillon: [{
          'Date_réception_échantillons': '01/09/2024',
          'Code_échantillon': 'La référence',
          Nature_matrice: 'ORGE',
          Commentaire: 'Une note',
          Analyse: []
        }]
      }
    })).toMatchInlineSnapshot(`
      [
        {
          "notes": "Une note",
          "sampleReference": "La référence",
          "substances": [],
        },
      ]
    `);
  });

  test('un xml avec 1 echantillon', () => {
    expect(extractSample(girpaXMLExample([{
      LMR: 10,
      Limite_de_quantification: '1,1',
      Résultat: '5,2',
      Substance_active_CAS: '?',
      Substance_active_anglais: 'bixafen'
    }]))).toMatchInlineSnapshot(`
      [
        {
          "notes": "Une note",
          "sampleReference": "La référence",
          "substances": [
            {
              "lmr": 10,
              "result": 5.2,
              "result_kind": "Q",
              "substance": {
                "kind": "SimpleResidue",
                "value": "RF-1056-001-PPP",
              },
            },
          ],
        },
      ]
    `);
  });

  test('extrait que les substances intéressantes', () => {
    expect(extractSample(girpaXMLExample([
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
        Limite_de_quantification:  '1',
        Résultat: '10,1',
        Substance_active_CAS: '15299-99-7',
        Substance_active_anglais: 'fluroxypyr'
      },
      {
        LMR: '-',
        Limite_de_quantification:  '1',
        Résultat: '8',
        Substance_active_CAS: '?',
        Substance_active_anglais: 'fluxapyroxad'
      }
    ]))![0].substances).toMatchInlineSnapshot(`
      [
        {
          "lmr": 10,
          "result": 0.3,
          "result_kind": "Q",
          "substance": {
            "kind": "SimpleResidue",
            "value": "RF-1056-001-PPP",
          },
        },
        {
          "lmr": 10,
          "result": 10.1,
          "result_kind": "Q",
          "substance": {
            "kind": "Analyte",
            "value": "RF-0215-003-PPP",
          },
        },
        {
          "lmr": null,
          "result": null,
          "result_kind": "NQ",
          "substance": {
            "kind": "SimpleResidue",
            "value": "RF-00000024-PAR",
          },
        },
      ]
    `);
  });
});


describe('getResidue', () => {
  test.each<[string, string, ReturnType<typeof getResidue>]>([
    ['', 'toto', null],
    ['', 'bixafen', {value: 'RF-1056-001-PPP', kind: 'SimpleResidue'}],
    ['', 'bixafen according reg.', {value: 'RF-1056-001-PPP', kind: 'SimpleResidue'}],
  ])('getResidue %#', (casNumber, englishName, expected) => {

    expect(getResidue(casNumber as z.infer<typeof residueCasNumberValidator>, englishName as z.infer<typeof residueEnglishNameValidator>)).toEqual(expected)

  })
})