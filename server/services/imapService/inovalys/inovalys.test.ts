import { describe, expect, test } from 'vitest';
import { extractAnalyzes } from './inovalys';

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
      extractAnalyzes([{ fileName: 'FILE_FICRES.csv', content: [] }])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Aucun fichier CSV pour l'échantillon de trouvé.]`
    );
    expect(() =>
      extractAnalyzes([
        { fileName: 'FILE_FICRES.csv', content: [] },
        { fileName: 'test.csv', content: [] }
      ])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Aucun fichier CSV pour l'échantillon de trouvé.]`
    );
    expect(() =>
      extractAnalyzes([
        { fileName: 'FILE_FICRES.csv', content: [] },
        { fileName: 'FILE_FICECH.csv', content: [] }
      ])
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Aucune donnée trouvée dans le fichier d'échantillon]`
    );
  });

  test('Extrait correctement un rapport d analyses', () => {
    expect(
      extractAnalyzes([
        {
          fileName: 'FILE_FICECH.csv',
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
          fileName: 'FILE_FICRES.csv',
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
              'Limite Quant. 1': '< 0.010',
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
              'Limite Quant. 1': '< 0.010',
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
              'Date Analyse': '23/10/2024',
              'Date Validation': '24/10/2024',
              Statut: 'Completed',
              'Résultat 1': '0,011',
              'Unité 1': 'mg/kg',
              'Limite Quant. 1': '>= 0.005',
              'Spécification 1': '0.150',
              'Résultat 2': '',
              'Unité 2': '',
              'Limite Quant. 2': '',
              'Spécification 2': '',
              'Incertitude ': '0.005',
              'Code Sandre': '1951',
              'N° mélange': '',
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
              'Date Analyse': '23/10/2024',
              'Date Validation': '24/10/2024',
              Statut: 'Completed',
              'Résultat 1': '0,011',
              'Unité 1': 'mg/kg',
              'Limite Quant. 1': '< 0.010',
              'Spécification 1': '0.150',
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
              "analysisMethod": "Multi",
              "casNumber": "107534-96-3",
              "codeSandre": "1694",
              "dateAnalysis": 2024-10-22T22:00:00.000Z,
              "label": "Tébuconazole",
              "lmr": 0.2,
              "result": 0.025,
              "result_kind": "Q",
            },
            {
              "analysisMethod": "Multi",
              "casNumber": null,
              "codeSandre": null,
              "dateAnalysis": 2024-10-22T22:00:00.000Z,
              "label": "Prothioconazole : prothioconazole-desthio (somme des isomères)",
              "result_kind": "NQ",
            },
            {
              "analysisMethod": "Mono",
              "casNumber": null,
              "codeSandre": "1951",
              "dateAnalysis": 2024-10-22T22:00:00.000Z,
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
