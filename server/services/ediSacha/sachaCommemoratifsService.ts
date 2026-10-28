import SachaReferentialError from 'maestro-shared/errors/sachaReferentialError';
import {
  type CommemoratifSigle,
  type CommemoratifValueSigle,
  SachaCommemoratifTypeDonnee
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import z from 'zod';
import { executeTransaction } from '../../repositories/kysely';
import { sachaCommemoratifRepository } from '../../repositories/sachaCommemoratifRepository';
import { sachaConfRepository } from '../../repositories/sachaConfRepository';

interface ReferenceCommemoratif {
  Sigle: string;
  Libelle: string;
  // Validé ou Gelé
  Statut: 'G' | 'V';
  //  A (Alphanumérique) ; N (Numérique) ; D (Date) ; V (Liste de valeur)
  TypeDonnee: 'V' | 'N' | 'A' | 'D';
  Unite?: string;
}

interface ReferenceCommemoratifsValeurs {
  Sigle: string;
  Libelle: string;
  Statut: 'G' | 'V';
}

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

interface ReferenceCommemoratifType {
  ReferenceCommemoratif: ReferenceCommemoratif;
  ReferenceCommemoratifsValeurs?: ReferenceCommemoratifsValeurs[];
}

export interface DonneesStandardisees {
  MessageParametres: { NomFichier: string };
  ReferenceCommemoratifType?: ReferenceCommemoratifType[];
}

export const updateSachaCommemoratifs = async (
  donneesStandardisees: DonneesStandardisees
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
    sigle: item.ReferenceCommemoratif.Sigle as CommemoratifSigle,
    libelle: item.ReferenceCommemoratif.Libelle,
    typeDonnee: TypeDonneeCodec.decode(item.ReferenceCommemoratif.TypeDonnee),
    unite: item.ReferenceCommemoratif.Unite || null,
    deprecated: item.ReferenceCommemoratif.Statut === 'G',
    values: (item.ReferenceCommemoratifsValeurs ?? []).map((valeur) => ({
      sigle: valeur.Sigle as CommemoratifValueSigle,
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
