import type { SachaContextSigle } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { CommemoratifSigle } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { describe, expect, test } from 'vitest';
import { parseReferentielPrescripteur } from './sachaContextsService';

const MessageParametres = { NomFichier: 'RP01DGALDGAL260803195529876' };

describe('parseReferentielPrescripteur', () => {
  test('reads the valid contexts and the level of their commemoratifs, without the frozen ones', () => {
    expect(
      parseReferentielPrescripteur({
        MessageParametres,
        ReferenceContextesType: [
          {
            ReferenceContextesIntervention: {
              Sigle: 'PR17_2026_RPDA_PBOV' as SachaContextSigle,
              Libelle: 'Plan de surveillance résidus de pesticides bovin',
              Statut: 'V'
            },
            ReferenceCommemoratifsInterventionContexte: [
              { SigleCommemoratif: 'TAXOEF' as CommemoratifSigle },
              { SigleCommemoratif: 'SEX1' as CommemoratifSigle },
              { SigleCommemoratif: 'SEX1' as CommemoratifSigle }
            ],
            ReferenceCommemoratifsEchantillonContexte: [
              { SigleCommemoratif: 'TEMPREC' as CommemoratifSigle }
            ]
          },
          {
            ReferenceContextesIntervention: {
              Sigle: 'PR17_2019_PREC_PBOV' as SachaContextSigle,
              Libelle: 'Plan 2019',
              Statut: 'G'
            }
          },
          {
            ReferenceContextesIntervention: {
              Sigle: 'PR17_2019_PREC_PBOV' as SachaContextSigle,
              Libelle: 'Doublon',
              Statut: 'V'
            }
          },
          {
            ReferenceContextesIntervention: {
              Sigle: 'PR17_2026_RPDA_PVOL' as SachaContextSigle,
              Libelle: 'Plan de surveillance résidus de pesticides volaille',
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
          commemoratifs: [
            { sigle: 'TAXOEF', level: 'Sample' },
            { sigle: 'SEX1', level: 'Sample' },
            { sigle: 'TEMPREC', level: 'SampleMatrix' }
          ]
        },
        {
          sigle: 'PR17_2026_RPDA_PVOL',
          libelle: 'Plan de surveillance résidus de pesticides volaille',
          commemoratifs: []
        }
      ]
    });
  });

  test('refuses a file without context', () => {
    expect(() => parseReferentielPrescripteur({ MessageParametres })).toThrow(
      'Ce fichier ne contient aucun contexte d’intervention valide.'
    );
  });
});
