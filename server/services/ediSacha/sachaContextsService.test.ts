import { describe, expect, test } from 'vitest';
import { parseReferentielPrescripteur } from './sachaContextsService';

const MessageParametres = { NomFichier: 'RP01DGALDGAL260803195529876' };

describe('parseReferentielPrescripteur', () => {
  test('reads the contexts, their status and the level of their commemoratifs', () => {
    expect(
      parseReferentielPrescripteur({
        MessageParametres,
        ReferenceContextesType: [
          {
            ReferenceContextesIntervention: {
              Sigle: 'PR17_2026_RPDA_PBOV',
              Libelle: 'Plan de surveillance résidus de pesticides bovin',
              Statut: 'V'
            },
            ReferenceCommemoratifsInterventionContexte: [
              { SigleCommemoratif: 'TAXOEF' },
              { SigleCommemoratif: 'SEX1' },
              { SigleCommemoratif: 'SEX1' }
            ],
            ReferenceCommemoratifsEchantillonContexte: [
              { SigleCommemoratif: 'TEMPREC' }
            ]
          },
          {
            ReferenceContextesIntervention: {
              Sigle: 'PR17_2019_PREC_PBOV',
              Libelle: 'Plan 2019',
              Statut: 'G'
            }
          },
          {
            ReferenceContextesIntervention: {
              Sigle: 'PR17_2019_PREC_PBOV',
              Libelle: 'Doublon',
              Statut: 'V'
            }
          }
        ]
      })
    ).toEqual({
      fileName: 'RP01DGALDGAL260803195529876',
      contexts: [
        {
          sigle: 'PR17_2026_RPDA_PBOV',
          libelle: 'Plan de surveillance résidus de pesticides bovin',
          deprecated: false,
          commemoratifs: [
            { sigle: 'TAXOEF', level: 'Sample' },
            { sigle: 'SEX1', level: 'Sample' },
            { sigle: 'TEMPREC', level: 'Analysis' }
          ]
        },
        {
          sigle: 'PR17_2019_PREC_PBOV',
          libelle: 'Plan 2019',
          deprecated: true,
          commemoratifs: []
        }
      ]
    });
  });

  test('refuses a file without context', () => {
    expect(() => parseReferentielPrescripteur({ MessageParametres })).toThrow(
      'Ce fichier ne contient aucun contexte d’intervention.'
    );
  });
});
