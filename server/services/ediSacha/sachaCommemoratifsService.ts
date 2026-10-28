import SachaReferentialError from 'maestro-shared/errors/sachaReferentialError';
import {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratifTypeDonnee
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import z from 'zod';
import { executeTransaction } from '../../repositories/kysely';
import { sachaCommemoratifRepository } from '../../repositories/sachaCommemoratifRepository';
import { sachaConfRepository } from '../../repositories/sachaConfRepository';
import { statusValidator } from './sachaValidator';

export const TypeDonneeCodec = z.codec(
  z.enum(['V', 'N', 'A', 'D']),
  SachaCommemoratifTypeDonnee,

  {
    encode: (value) => {
      switch (value) {
        case 'date':
          return 'D';
        case 'list':
          return 'V';
        case 'numeric':
          return 'N';
        case 'text':
          return 'A';
      }
    },
    decode: (value) => {
      switch (value) {
        case 'D':
          return 'date';
        case 'V':
          return 'list';
        case 'N':
          return 'numeric';
        case 'A':
          return 'text';
      }
    }
  }
);

export const DonneesStandardiseesXml = z.object({
  MessageParametres: z.object({ NomFichier: z.string() }),
  ReferenceCommemoratifType: z
    .array(
      z.object({
        ReferenceCommemoratif: z.object({
          Sigle: CommemoratifSigle,
          Libelle: z.string(),
          Statut: statusValidator,
          Unite: z.string().optional(),
          TypeDonnee: TypeDonneeCodec
        }),
        ReferenceCommemoratifsValeurs: z
          .array(
            z.object({
              Sigle: CommemoratifValueSigle,
              Libelle: z.string(),
              Statut: statusValidator
            })
          )
          .optional()
      })
    )
    .optional()
});

export const updateSachaCommemoratifs = async (
  donneesStandardisees: z.output<typeof DonneesStandardiseesXml>
): Promise<string> => {
  const nomFichier = donneesStandardisees.MessageParametres.NomFichier;

  const referenceCommemoratifTypes =
    donneesStandardisees.ReferenceCommemoratifType ?? [];

  if (!referenceCommemoratifTypes.length) {
    throw new SachaReferentialError(
      'Ce fichier ne contient aucune définition de commémoratif.'
    );
  }

  const commemoratifs = referenceCommemoratifTypes.map((item) => ({
    sigle: item.ReferenceCommemoratif.Sigle,
    libelle: item.ReferenceCommemoratif.Libelle,
    typeDonnee: item.ReferenceCommemoratif.TypeDonnee,
    unite: item.ReferenceCommemoratif.Unite || null,
    deprecated: item.ReferenceCommemoratif.Statut === 'G',
    values: (item.ReferenceCommemoratifsValeurs ?? []).map((valeur) => ({
      sigle: valeur.Sigle,
      libelle: valeur.Libelle,
      deprecated: valeur.Statut === 'G'
    }))
  }));

  await executeTransaction(async (trx) => {
    await sachaConfRepository.update(
      { versionReferenceStandardisees: nomFichier },
      trx
    );
    await sachaCommemoratifRepository.upsertAll(commemoratifs, trx);
    await sachaCommemoratifRepository.deprecateMissing(commemoratifs, trx);
  });

  return nomFichier;
};
