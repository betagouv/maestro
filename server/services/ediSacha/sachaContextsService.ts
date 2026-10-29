import { uniq, uniqBy } from 'lodash-es';
import SachaReferentialError from 'maestro-shared/errors/sachaReferentialError';
import { SachaContextSigle } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { CommemoratifSigle } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import type { SachaContext } from 'maestro-shared/schema/SachaContext/SachaContext';
import z from 'zod';
import { executeTransaction } from '../../repositories/kysely';
import { sachaCommemoratifRepository } from '../../repositories/sachaCommemoratifRepository';
import { sachaConfRepository } from '../../repositories/sachaConfRepository';
import { sachaContextRepository } from '../../repositories/sachaContextRepository';
import { statusValidator } from './sachaValidator';

const ReferenceCommemoratifsATransmettreXml = z
  .array(z.object({ SigleCommemoratif: CommemoratifSigle }))
  .optional();

export const ReferentielPrescripteurXml = z.object({
  MessageParametres: z.object({ NomFichier: z.string() }),
  ReferenceContextesType: z
    .array(
      z.object({
        ReferenceContextesIntervention: z.object({
          Sigle: SachaContextSigle,
          Libelle: z.string(),
          Statut: statusValidator
        }),
        ReferenceCommemoratifsInterventionContexte:
          ReferenceCommemoratifsATransmettreXml,
        ReferenceCommemoratifsEchantillonContexte:
          ReferenceCommemoratifsATransmettreXml
      })
    )
    .optional()
});

export const parseReferentielPrescripteur = (
  referentielPrescripteur: z.output<typeof ReferentielPrescripteurXml>
): { fileName: string; contexts: SachaContext[] } => {
  const contexts = uniqBy(
    referentielPrescripteur.ReferenceContextesType ?? [],
    'ReferenceContextesIntervention.Sigle'
  )
    .filter((item) => item.ReferenceContextesIntervention.Statut !== 'G')
    .map((item) => ({
      sigle: item.ReferenceContextesIntervention.Sigle,
      libelle: item.ReferenceContextesIntervention.Libelle,
      commemoratifs: uniqBy(
        [
          ...(item.ReferenceCommemoratifsInterventionContexte ?? []).map(
            ({ SigleCommemoratif }) => ({
              sigle: SigleCommemoratif,
              level: 'Sample' as const
            })
          ),
          ...(item.ReferenceCommemoratifsEchantillonContexte ?? []).map(
            ({ SigleCommemoratif }) => ({
              sigle: SigleCommemoratif,
              level: 'SampleMatrix' as const
            })
          )
        ],
        'sigle'
      )
    }));

  if (contexts.length === 0) {
    throw new SachaReferentialError(
      'Ce fichier ne contient aucun contexte d’intervention valide.'
    );
  }

  return {
    fileName: referentielPrescripteur.MessageParametres.NomFichier,
    contexts
  };
};

export const updateSachaContexts = async (
  referentielPrescripteur: z.output<typeof ReferentielPrescripteurXml>
): Promise<string> => {
  const { fileName, contexts } = parseReferentielPrescripteur(
    referentielPrescripteur
  );

  await executeTransaction(async (trx) => {
    const knownSigles = await sachaCommemoratifRepository.findAllSigles(trx);
    const unknownSigles = uniq(
      contexts.flatMap(({ commemoratifs }) =>
        commemoratifs
          .map(({ sigle }) => sigle)
          .filter((sigle) => !knownSigles.includes(sigle))
      )
    );
    if (unknownSigles.length > 0) {
      throw new SachaReferentialError(
        `Importer d’abord les données standardisées (DS01) : commémoratif${unknownSigles.length > 1 ? 's' : ''} ${unknownSigles.join(', ')} inconnu${unknownSigles.length > 1 ? 's' : ''}.`
      );
    }

    await sachaConfRepository.update(
      { versionReferencePrescripteur: fileName },
      trx
    );
    await sachaContextRepository.synchronize(contexts, trx);
  });

  return fileName;
};
