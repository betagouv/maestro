import { describe, expect, test } from 'vitest';
import { extractAnalyzes, inovalysRefClientValidator } from './inovalys';

describe('Parse correctement les fichiers CSV', () => {
  test('Vérifie la présence des fichiers CSV', () => {
    expect(() => extractAnalyzes([])).toThrowErrorMatchingInlineSnapshot(
      `[Error: Aucun fichier CSV pour les résultats de trouvé.]`
    );
    expect(() =>
      extractAnalyzes([{ fileName: 'test.csv', content: [] }])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Aucun fichier CSV pour les résultats de trouvé.]`
    );
    expect(() =>
      extractAnalyzes([{ fileName: 'FILE_CO2.csv', content: [] }])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Aucun fichier CSV pour l'échantillon de trouvé.]`
    );
    expect(() =>
      extractAnalyzes([
        { fileName: 'FILE_CO2.csv', content: [] },
        { fileName: 'test.csv', content: [] }
      ])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Aucun fichier CSV pour l'échantillon de trouvé.]`
    );
    expect(() =>
      extractAnalyzes([
        { fileName: 'FILE_CO2.csv', content: [] },
        { fileName: 'FILE_CO1.csv', content: [] }
      ])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Aucune donnée trouvée dans le fichier d'échantillon]`
    );
  });

  test('Extrait correctement un rapport d analyses', () => {
    expect(
      extractAnalyzes([
        {
          fileName: 'FILE_CO1.csv',
          content: [
            {
              Dossier: 'Dossier1',
              Echant: 'Echant1',
              Famille: 'V26',
              Produit: 'LES',
              SousProd: '',
              Libellé: 'Légumes secs',
              'Réf Client': 'Ref client',
              Description: 'LENTILLES SECHE A LA RECOLTE',
              Identification: '',
              Motif: '',
              'Date Prélèvement': '10/09/2020',
              'Lieu Prélèvement': '418  RUE DE TOTO',
              Commentaire:
                'Respect de la Directive 2002/63 CE sur les quantités nécessaires ',
              Conclusion: '',
              '': ''
            }
          ]
        },
        {
          fileName: 'FILE_CO2.csv',
          content: [
            {
              Echantillon: 'Echant1',
              Dossier: 'Dossier1',
              Famille: 'V26',
              Produit: 'LES',
              Détermination: 'Tébuconazole',
              'N° Ordre': '9325220',
              Paramètre: 'TEBUC|LCMSMS-mgkg|TEBUC|brut-imp',
              'Code Méth': 'LCMSMS',
              'Lib Méthode': 'LC/MS/MS',
              'Réf Méthode': 'M-ARCO/M/021',
              Cofrac: 'N',
              Bilan: 'MULTIPEST-COMPLET',
              'Unité Tech': 'MARCO',
              'Date Analyse': '23/10/2024',
              'Date Validation': '24/10/2024',
              Statut: 'Completed',
              'Résultat 1': '0,025',
              'Unité 1': 'mg/kg',
              'Limite Quant. 1': '>= 0.005',
              'Spécification 1': '0.2',
              'Résultat 2': '',
              'Unité 2': '',
              'Limite Quant. 2': '',
              'Spécification 2': '',
              'Incertitude ': '0.013',
              'Code Sandre': '1694',
              'N° mélange': '',
              'Numéro CAS': '107534-96-3',
              '': ''
            },
            {
              Echantillon: 'Echant1',
              Dossier: 'Dossier1',
              Famille: 'V26',
              Produit: 'LES',
              Détermination:
                'Prothioconazole : prothioconazole-desthio (somme des isomères)',
              'N° Ordre': '9324710',
              Paramètre: 'PROTHREG|LCMSMS-mgkg|PROTHREG|brut-imp',
              'Code Méth': 'LCMSMS',
              'Lib Méthode': 'LC/MS/MS',
              'Réf Méthode': 'M-ARCO/M/021',
              Cofrac: 'N',
              Bilan: 'MULTIPEST-COMPLET',
              'Unité Tech': 'MARCO',
              'Date Analyse': '23/10/2024',
              'Date Validation': '24/10/2024',
              Statut: 'Completed',
              'Résultat 1': 'd<LQ',
              'Unité 1': 'mg/kg',
              'Limite Quant. 1': '>= 0.005',
              'Spécification 1': '1',
              'Résultat 2': '',
              'Unité 2': '',
              'Limite Quant. 2': '',
              'Spécification 2': '',
              'Incertitude ': '',
              'Code Sandre': '',
              'N° mélange': '',
              'Numéro CAS': '',
              '': ''
            },
            {
              Echantillon: 'Echant1',
              Dossier: 'Dossier1',
              Famille: 'V26',
              Produit: 'LES',
              Détermination: 'Azoxystrobine',
              'N° Ordre': '9320580',
              Paramètre: 'AZOXY|LCMSMS-mgkg|AZOXY|brut-imp',
              'Code Méth': 'LCMSMS',
              'Lib Méthode': 'LC/MS/MS',
              'Réf Méthode': 'M-ARCO/M/022',
              Cofrac: 'N',
              Bilan: 'MULTIPEST-COMPLET',
              'Unité Tech': 'MARCO',
              'Date Analyse': '',
              'Date Validation': '24/10/2024',
              Statut: 'Completed',
              'Résultat 1': '0,011',
              'Unité 1': 'mg/kg',
              'Limite Quant. 1': '>= 0.005',
              'Spécification 1': '0,150',
              'Résultat 2': '',
              'Unité 2': '',
              'Limite Quant. 2': '',
              'Spécification 2': '',
              'Incertitude ': '0.005',
              'Code Sandre': '1951',
              'N° mélange': '',
              '': ''
            }
          ]
        }
      ])
    ).toMatchInlineSnapshot(`
      [
        {
          "notes": "Respect de la Directive 2002/63 CE sur les quantités nécessaires ",
          "residues": [
            {
              "analysisDate": "2024-10-23",
              "analysisMethod": "Multi",
              "casNumber": "107534-96-3",
              "codeSandre": "1694",
              "label": "Tébuconazole",
              "lmr": 0.2,
              "result": 0.025,
              "result_kind": "Q",
            },
            {
              "analysisDate": "2024-10-23",
              "analysisMethod": "Multi",
              "casNumber": null,
              "codeSandre": null,
              "label": "Prothioconazole : prothioconazole-desthio (somme des isomères)",
              "result_kind": "NQ",
            },
            {
              "analysisDate": null,
              "analysisMethod": "Mono",
              "casNumber": null,
              "codeSandre": "1951",
              "label": "Azoxystrobine",
              "lmr": 0.15,
              "result": 0.011,
              "result_kind": "Q",
            },
          ],
          "sampleReference": "Ref client",
        },
      ]
    `);
  });
});

test(`un résidu issue d'un calcul avec comme résultat <LQ est redéfini en ND`, () => {
  expect(
    extractAnalyzes([
      {
        fileName: 'FILE_CO1.csv',
        content: [
          {
            Dossier: 'Dossier1',
            Echant: 'Echant1',
            Famille: 'V26',
            Produit: 'LES',
            SousProd: '',
            Libellé: 'Légumes secs',
            'Réf Client': 'Ref client',
            Description: 'LENTILLES SECHE A LA RECOLTE',
            Identification: '',
            Motif: '',
            'Date Prélèvement': '10/09/2020',
            'Lieu Prélèvement': '418  RUE DE TOTO',
            Commentaire:
              'Respect de la Directive 2002/63 CE sur les quantités nécessaires ',
            Conclusion: '',
            '': ''
          }
        ]
      },
      {
        fileName: 'FILE_CO2.csv',
        content: [
          {
            Echantillon: 'Echant1',
            Dossier: 'Dossier1',
            Famille: 'V26',
            Produit: 'LES',
            Détermination: 'Tébuconazole',
            'N° Ordre': '9325220',
            Paramètre: 'TEBUC|LCMSMS-mgkg|TEBUC|brut-imp',
            'Code Méth': 'CALCUL',
            'Réf Méthode': 'M-ARCO/M/021',
            Cofrac: 'N',
            Bilan: 'MULTIPEST-COMPLET',
            'Unité Tech': 'MARCO',
            'Date Analyse': '23/10/2024',
            'Date Validation': '24/10/2024',
            Statut: 'Completed',
            'Résultat 1': '<LQ',
            'Unité 1': 'mg/kg',
            'Limite Quant. 1': '>= 0.005',
            'Spécification 1': '0.2',
            'Résultat 2': '',
            'Unité 2': '',
            'Limite Quant. 2': '',
            'Spécification 2': '',
            'Incertitude ': '0.013',
            'Code Sandre': '1694',
            'N° mélange': '',
            'Numéro CAS': '107534-96-3',
            '': ''
          },
          {
            Echantillon: 'Echant1',
            Dossier: 'Dossier1',
            Famille: 'V26',
            Produit: 'LES',
            Détermination:
              'Prothioconazole : prothioconazole-desthio (somme des isomères)',
            'N° Ordre': '9324710',
            Paramètre: 'PROTHREG|LCMSMS-mgkg|PROTHREG|brut-imp',
            'Code Méth': 'CALCUL',
            'Lib Méthode': 'LC/MS/MS',
            'Réf Méthode': 'M-ARCO/M/021',
            Cofrac: 'N',
            Bilan: 'MULTIPEST-COMPLET',
            'Unité Tech': 'MARCO',
            'Date Analyse': '23/10/2024',
            'Date Validation': '24/10/2024',
            Statut: 'Completed',
            'Résultat 1': '2',
            'Unité 1': 'mg/kg',
            'Limite Quant. 1': '>= 0.005',
            'Spécification 1': '1',
            'Résultat 2': '',
            'Unité 2': '',
            'Limite Quant. 2': '',
            'Spécification 2': '',
            'Incertitude ': '',
            'Code Sandre': '',
            'N° mélange': '',
            'Numéro CAS': '',
            '': ''
          }
        ]
      }
    ])
  ).toMatchInlineSnapshot(`
    [
      {
        "notes": "Respect de la Directive 2002/63 CE sur les quantités nécessaires ",
        "residues": [
          {
            "analysisDate": "2024-10-23",
            "analysisMethod": "Multi",
            "casNumber": "107534-96-3",
            "codeSandre": "1694",
            "label": "Tébuconazole",
            "result_kind": "ND",
          },
          {
            "analysisDate": "2024-10-23",
            "analysisMethod": "Multi",
            "casNumber": null,
            "codeSandre": null,
            "label": "Prothioconazole : prothioconazole-desthio (somme des isomères)",
            "lmr": 1,
            "result": 2,
            "result_kind": "Q",
          },
        ],
        "sampleReference": "Ref client",
      },
    ]
  `);
});
// test('Extrait avec des fichiers', () => {
//   const getBuffer = (
//     fileName: string
//   ): Pick<Attachment, 'content' | 'filename' | 'contentType'> => {
//     const fullPath = path.join(import.meta.dirname, 'tests', fileName);
//     return {
//       filename: fileName,
//       content: fs.readFileSync(fullPath, {
//         encoding: 'latin1'
//       }) as unknown as Buffer,
//       contentType: ''
//     };
//   };
//   expect(
//     inovalysConf.exportDataFromEmail([
//       {
//         filename: 'reference.pdf',
//         content: Buffer.alloc(1),
//         contentType: 'application/pdf'
//       },
//       {
//         filename: 'dossier1_CO0.csv',
//         content: Buffer.alloc(1),
//         contentType: ''
//       },
//       getBuffer('CO1.csv'),
//       getBuffer('CO2.csv')
//     ])
//   ).toMatchSnapshot();
// });
test.each<[string, string]>([
  ['OCC-25-0007', 'OCC-25-0007'],
  ['OCC-25-0007-01', 'OCC-25-0007'],
  ['OCC-25-0007-1', 'OCC-25-0007']
])('inovalysRefClientValidator', (value, expected) => {
  expect(inovalysRefClientValidator.parse(value)).toBe(expected);
});
