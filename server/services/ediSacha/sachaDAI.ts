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
import { SampleMatrixSpecificData } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';
import { SampleSpecificDataRecord } from 'maestro-shared/schema/Sample/SampleSpecificDataAttribute';
import { toMaestroDate } from 'maestro-shared/utils/date';
import { Laboratories, SachaConf } from '../../repositories/kysely.type';
import { sachaCommemoratifRepository } from '../../repositories/sachaCommemoratifRepository';
import { sachaConfRepository } from '../../repositories/sachaConfRepository';
import { sampleSpecificDataRepository } from '../../repositories/sampleSpecificDataRepository';
import {
  NotPPVMatrix,
  SigleContexteIntervention,
  SigleMatrix,
  SiglePlanAnalyse
} from './sachaReferential';
import { sendSachaFile } from './sachaSender';
import { generateXML, LaboratorySachaData, XmlFile } from './sachaToXML';
import { toSachaDateTime } from './sachaValidator';

export const generateAndSendSachaDAI = async (
  sample: SampleChecked,
  item: SampleItem,
  laboratory: Laboratories
): Promise<void> => {
  const dateNow = Date.now();
  const sachaCommemoratifRecord = await sachaCommemoratifRepository.findAll();
  const specificDataRecord = await sampleSpecificDataRepository.findAll();
  const sachaConf = await sachaConfRepository.get();

  const xmlFile = await generateXMLDAI(
    sample,
    item,
    dateNow,
    specificDataRecord,
    sachaCommemoratifRecord,
    sachaConf,
    laboratory
  );

  await sendSachaFile(xmlFile, dateNow);
};

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
  sampleSpecifDataRecord: SampleSpecificDataRecord,
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
    sampleSpecifDataRecord,
    sachaCommemoratifRecord
  );

  return generateXML(
    'DA01',
    {
      DemandeType: {
        DialogueDemandeIntervention: {
          NumeroDAP: Number(
            `${new Date(dateNow).getFullYear()}${sample.reference.substring(sample.reference.lastIndexOf('-') + 1)}${sampleItem.copyNumber}${sampleItem.itemNumber}`
          ),
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
  specificData: SampleMatrixSpecificData,
  sampleSpecifDataRecord: SampleSpecificDataRecord,
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
      const conf = sampleSpecifDataRecord[specificDataKey];
      if (conf?.inDai) {
        const specificDataValue: string =
          specificData[specificDataKey as keyof SampleMatrixSpecificData];

        if (!conf.sachaCommemoratifSigle) {
          throw new Error(
            `Configuration SACHA incomplète: ${specificDataKey} `
          );
        }

        const typeDonnee =
          sachaCommemoratifRecord[conf.sachaCommemoratifSigle].typeDonnee;

        if (typeDonnee === 'list') {
          if (
            !sampleSpecifDataRecord[specificDataKey].values[specificDataValue]
          ) {
            if (!sampleSpecifDataRecord[specificDataKey].optional) {
              throw new Error(
                `Configuration SACHA incomplète: ${specificDataKey} ${specificDataValue}`
              );
            }
          } else {
            commemoratifs.push({
              sigle: conf.sachaCommemoratifSigle,
              sigleValue:
                sampleSpecifDataRecord[specificDataKey].values[
                  specificDataValue
                ]
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
            sigle: conf.sachaCommemoratifSigle,
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
