import { XMLParser } from 'fast-xml-parser';
import {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratif
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { sachaCommemoratifRepository } from '../../repositories/sachaCommemoratifRepository';

interface ReferenceCommemoratif {
  Cle: string;
  Sigle: string;
  Libelle: string;
  Statut: string;
  TypeDonnee?: string;
  Unite?: string;
}

interface ReferenceCommemoratifsValeurs {
  Cle: string;
  Sigle: string;
  Libelle: string;
  Statut: string;
}

interface ReferenceCommemoratifType {
  ReferenceCommemoratif: ReferenceCommemoratif;
  ReferenceCommemoratifsValeurs: ReferenceCommemoratifsValeurs[];
}

export const updateSachaCommemoratifs = async (xmlContent: string) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    isArray: (name) =>
      name === 'ReferenceCommemoratifType' ||
      name === 'ReferenceCommemoratifsValeurs'
  });

  const parsed = parser.parse(xmlContent);

  const referenceCommemoratifTypes: ReferenceCommemoratifType[] =
    parsed.DonneesStandardisees.ReferenceCommemoratifType ?? [];

  const results: SachaCommemoratif[] = referenceCommemoratifTypes.map(
    (item) => ({
      cle: item.ReferenceCommemoratif.Cle,
      sigle: item.ReferenceCommemoratif.Sigle as CommemoratifSigle,
      libelle: item.ReferenceCommemoratif.Libelle,
      statut: item.ReferenceCommemoratif.Statut,
      typeDonnee: item.ReferenceCommemoratif.TypeDonnee ?? null,
      unite: item.ReferenceCommemoratif.Unite ?? null,

      values: (item.ReferenceCommemoratifsValeurs ?? []).map((valeur) => ({
        cle: valeur.Cle,
        sigle: valeur.Sigle as CommemoratifValueSigle,
        libelle: valeur.Libelle,
        statut: valeur.Statut
      }))
    })
  );

  await sachaCommemoratifRepository.upsertAll(results);
};
