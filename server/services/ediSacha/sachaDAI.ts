import { ProgrammingPlanKindWithSacha } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratifRecord
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import {
  getSampleItemReference,
  SampleItem
} from 'maestro-shared/schema/Sample/SampleItem';
import { SachaFieldConfig } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { SpecificData } from 'maestro-shared/schema/SpecificData/SpecificData';
import { toMaestroDate } from 'maestro-shared/utils/date';
import { SachaConf } from '../../repositories/kysely.type';
import {
  NotPPVMatrix,
  SigleContexteIntervention,
  SigleMatrix,
  SiglePlanAnalyse
} from './sachaReferential';
import {
  generateXML,
  getNumeroDAP,
  LaboratorySachaData,
  XmlFile
} from './sachaToXML';
import { toSachaDateTime } from './sachaValidator';

export const generateXMLDAI = (
  sample: Pick<
    SampleChecked,
    | 'specificData'
    | 'sampledAt'
    | 'lastUpdatedAt'
    | 'company'
    | 'ownerEmail'
    | 'sampler'
    | 'department'
    | 'matrix'
    | 'reference'
  >,
  sampleItem: Pick<
    SampleItem,
    'sealId' | 'itemNumber' | 'copyNumber' | 'substanceKind'
  >,
  dateNow: number,
  sachaFieldConfigs: SachaFieldConfig[],
  sachaCommemoratifRecord: SachaCommemoratifRecord,
  sachaConf: SachaConf,
  laboratory: LaboratorySachaData
): Promise<XmlFile> => {
  const programmingPlanKind = sample.specificData
    .programmingPlanKind as ProgrammingPlanKindWithSacha;

  if (!ProgrammingPlanKindWithSacha.options.includes(programmingPlanKind)) {
    throw new Error(`Pas d'EDI Sacha pour ${programmingPlanKind}`);
  }

  const matrix = sample.matrix;
  if (!(matrix in SigleMatrix)) {
    throw new Error(
      `Pas de Sigle SACHA associé à la matrice ${sample.matrix}.`
    );
  }

  if (sampleItem.substanceKind === 'Any') {
    throw new Error("Pas de plan d'analyse de configuré.");
  }

  const commemoratifs = getCommemoratifs(
    sample.specificData,
    sachaFieldConfigs,
    sachaCommemoratifRecord
  );

  return generateXML(
    'DA01',
    {
      DemandeType: {
        DialogueDemandeIntervention: {
          NumeroDAP: getNumeroDAP(sample, sampleItem),
          SigleContexteIntervention:
            SigleContexteIntervention[programmingPlanKind],
          DateIntervention: toMaestroDate(sample.sampledAt),
          DateModification: toSachaDateTime(sample.lastUpdatedAt)
        },
        ReferenceEtablissementType: {
          ReferenceEtablissement: {
            //FIXME EDI
            SigleIdentifiant: '',
            Identifiant: sample.company.name,
            Nom: sample.company.name,
            CodePostal: `${sample.company.postalCode ?? ''} ${sample.company.city ?? ''}`,
            Adresse1: sample.company.address ?? undefined,
            Email: sample.ownerEmail ?? undefined
          }
        },
        DialogueActeurType: {
          DialogueActeur: {
            //FIXME EDI
            SigleIdentifiant: '',
            Identifiant: '',
            Nom: sample.sampler.name ?? ''
            //FIXME EDI email
          }
        },
        DialogueEchantillonCommemoratifType: [
          {
            DialogueEchantillonComplet: {
              NumeroEchantillon: sampleItem.itemNumber,
              SigleMatriceSpecifique: SigleMatrix[matrix as NotPPVMatrix],
              NumeroEtiquette: getSampleItemReference(
                sample,
                sampleItem.itemNumber,
                sampleItem.copyNumber
              ),
              Commentaire: sampleItem.sealId ?? ''
            },
            DialogueCommemoratif: commemoratifs.map((c) => {
              if ('sigleValue' in c) {
                return {
                  Sigle: c.sigle,
                  SigleValeur: c.sigleValue
                };
              }
              return {
                Sigle: c.sigle,
                TexteValeur: c.textValue
              };
            })
          }
        ],
        ReferencePlanAnalyseType: {
          ReferencePlanAnalyseEffectuer: {
            SiglePlanAnalyse: SiglePlanAnalyse[sampleItem.substanceKind]
          },
          ReferencePlanAnalyseContenu: {
            LibelleMatrice: '',
            SigleAnalyte: '',
            SigleMethodeSpecifique: '',
            //FIXME EDI ??
            Depistage: false,
            Confirmation: false,
            Statut: 'G'
          }
        }
      }
    },
    dateNow,
    sample.department,
    sachaConf,
    laboratory
  );
};

export const getCommemoratifs = (
  specificData: SpecificData,
  sachaFieldConfigs: SachaFieldConfig[],
  sachaCommemoratifRecord: SachaCommemoratifRecord
): ({ sigle: CommemoratifSigle } & (
  | { textValue: string }
  | { sigleValue: CommemoratifValueSigle }
))[] => {
  const commemoratifs: ReturnType<typeof getCommemoratifs> = [];
  for (const specificDataKey of Object.keys(specificData)) {
    if (
      specificDataKey !== 'programmingPlanKind' &&
      specificDataKey in specificData
    ) {
      const conf = sachaFieldConfigs.find((fc) => fc.key === specificDataKey);
      if (conf?.inDai) {
        const specificDataValue: string = specificData[
          specificDataKey
        ] as string;

        if (!conf.sachaCommemoratifSigle) {
          throw new Error(
            `Configuration SACHA incomplète: ${specificDataKey} `
          );
        }

        const typeDonnee =
          sachaCommemoratifRecord[
            conf.sachaCommemoratifSigle as CommemoratifSigle
          ].typeDonnee;

        if (typeDonnee === 'list') {
          const sigleValue =
            conf.options.find((o) => o.value === specificDataValue)
              ?.sachaCommemoratifValueSigle ?? null;
          if (!sigleValue) {
            if (!conf.optional) {
              throw new Error(
                `Configuration SACHA incomplète: ${specificDataKey} ${specificDataValue}`
              );
            }
          } else {
            commemoratifs.push({
              sigle: conf.sachaCommemoratifSigle as CommemoratifSigle,
              sigleValue: sigleValue as CommemoratifValueSigle
            });
          }
        } else {
          let textValue;
          if (typeDonnee === 'date') {
            textValue = toSachaDateTime(new Date(specificDataValue));
          } else {
            textValue = `${specificDataValue}`;
          }
          commemoratifs.push({
            sigle: conf.sachaCommemoratifSigle as CommemoratifSigle,
            textValue
          });
        }
      } else if (conf === undefined) {
        throw new Error(`Configuration SACHA incomplète: ${specificDataKey}`);
      }
    }
  }
  return commemoratifs;
};
