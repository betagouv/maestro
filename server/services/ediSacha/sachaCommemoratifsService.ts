import { XMLParser } from 'fast-xml-parser';
import {
  CommemoratifSigle,
  CommemoratifValueSigle
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { executeTransaction } from '../../repositories/kysely';
import { sachaCommemoratifRepository } from '../../repositories/sachaCommemoratifRepository';
import { sampleSpecificDataRepository } from '../../repositories/sampleSpecificDataRepository';

interface ReferenceCommemoratif {
  Sigle: string;
  Libelle: string;
  Statut: 'G' | 'V';
  //FIXME EDI
  TypeDonnee?: string;
  Unite?: string;
}

interface ReferenceCommemoratifsValeurs {
  Sigle: string;
  Libelle: string;
  Statut: 'G' | 'V';
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

  if (!referenceCommemoratifTypes.length) {
    throw new Error('Ce fichier ne contient aucune définition de Commémoratif');
  }

  const results = referenceCommemoratifTypes.map((item) => ({
    sigle: item.ReferenceCommemoratif.Sigle as CommemoratifSigle,
    libelle: item.ReferenceCommemoratif.Libelle,
    statut: item.ReferenceCommemoratif.Statut,
    typeDonnee: item.ReferenceCommemoratif.TypeDonnee ?? null,
    unite: item.ReferenceCommemoratif.Unite ?? null,

    values: (item.ReferenceCommemoratifsValeurs ?? []).map((valeur) => ({
      sigle: valeur.Sigle as CommemoratifValueSigle,
      libelle: valeur.Libelle,
      statut: valeur.Statut
    }))
  }));

  const current = await sampleSpecificDataRepository.findAll();

  await executeTransaction(async (trx) => {
    for (const attribute of Object.keys(current)) {
      const { values: specificDataAttributeValues, ...specificDataAttribute } =
        current[attribute];
      const commemoratif = results.find(
        (r) => r.sigle === specificDataAttribute.sachaCommemoratifSigle
      );

      //Si le commemoratif actuellement utilisé passe à "Gelé", il faut arrêter de l'utiliser
      if (commemoratif && commemoratif.statut === 'G') {
        await sampleSpecificDataRepository.deleteSampleSpecificDataAttributeValues(
          attribute,
          trx
        );

        await sampleSpecificDataRepository.updateSampleSpecificDataAttribute(
          {
            ...specificDataAttribute,
            sachaCommemoratifSigle: null
          },
          trx
        );
      } else {
        //Si le commémoratif est toujours Valide, il faut vérifier qu'on utilise pas une Value gelée

        for (const [
          attributeValue,
          sachaCommemoratifValueSigle
        ] of Object.entries(specificDataAttributeValues)) {
          const commemoratifValue = commemoratif?.values.find(
            (v) => v.sigle === sachaCommemoratifValueSigle
          );

          if (commemoratifValue && commemoratifValue.statut === 'G') {
            await sampleSpecificDataRepository.deleteSampleSpecificDataAttributeValue(
              attribute,
              attributeValue,
              trx
            );
          }
        }
      }
    }

    await sachaCommemoratifRepository.upsertAll(
      results
        .filter((r) => r.statut === 'V')
        .map((r) => {
          const { statut, values, ...commemoratif } = r;
          return {
            ...commemoratif,
            values: values
              .filter((v) => v.statut === 'V')
              .map((v) => {
                const { statut: _s, ...commemoratifValue } = v;
                return commemoratifValue;
              })
          };
        }),
      trx
    );
  });
};
