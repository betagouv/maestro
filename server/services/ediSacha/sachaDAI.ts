import { isNil } from 'lodash-es';
import type { LaboratoryWithSacha } from 'maestro-shared/schema/Laboratory/Laboratory';
import type {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratifRecord
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import type { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import type { SachaFieldConfig } from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import type { SpecificData } from 'maestro-shared/schema/SpecificData/SpecificData';
import type { SachaConf } from '../../repositories/kysely.type';
import { sachaCommemoratifRepository } from '../../repositories/sachaCommemoratifRepository';
import { sachaConfRepository } from '../../repositories/sachaConfRepository';
import { specificDataFieldConfigRepository } from '../../repositories/specificDataFieldConfigRepository';
import type { DaiSentResult } from '../daiSendingService';
import { documentService } from '../documentService';
import { referencesFromSample, SampleReference } from './sachaReferences';
import {
  type NotPPVMatrix,
  SigleContexteIntervention,
  SigleMatrix,
  SiglePlanAnalyse
} from './sachaReferential';
import { sendSachaFile } from './sachaSender';
import { generateXML, getSenderSachaSigle, type XmlFile } from './sachaToXML';
import { toSachaDateTime } from './sachaValidator';

export const generateXMLDAI = (
  sample: Pick<
    SampleChecked,
    | 'specificData'
    | 'sampledDate'
    | 'lastUpdatedAt'
    | 'company'
    | 'ownerEmail'
    | 'sampler'
    | 'department'
    | 'matrix'
    | 'reference'
    | 'sentAt'
  >,
  subPlanNumber: string,
  sampleItem: Pick<
    SampleItem,
    'sealId' | 'itemNumber' | 'copyNumber' | 'substanceKind'
  >,
  dateNow: number,
  sachaFieldConfigs: SachaFieldConfig[],
  sachaCommemoratifRecord: SachaCommemoratifRecord,
  sachaConf: SachaConf,
  laboratory: LaboratoryWithSacha,
  withSacha = true
): Promise<XmlFile> => {
  if (!withSacha) {
    throw new Error(`Pas d'EDI Sacha pour ${subPlanNumber}`);
  }

  const matrix = sample.matrix;
  if (!(matrix in SigleMatrix)) {
    throw new Error(
      `Pas de Sigle SACHA associé à la matrice ${sample.matrix}.`
    );
  }

  const siglePlanAnalyse = SiglePlanAnalyse[sampleItem.substanceKind];
  if (isNil(siglePlanAnalyse)) {
    throw new Error("Pas de plan d'analyse de configuré.");
  }

  const commemoratifs = getCommemoratifs(
    sample.specificData,
    sachaFieldConfigs,
    sachaCommemoratifRecord
  );

  const { numeroDAP, numeroEtiquette } = referencesFromSample(
    SampleReference.parse(sample.reference),
    sample.sentAt ? sample.sentAt.getTime() : dateNow,
    sampleItem.itemNumber
  );

  return generateXML(
    'DA01',
    {
      DemandeType: {
        DialogueDemandeIntervention: {
          NumeroDAP: Number(numeroDAP),
          SigleContexteIntervention: SigleContexteIntervention[subPlanNumber],
          DateIntervention: sample.sampledDate,
          DateModification: toSachaDateTime(sample.lastUpdatedAt)
        },
        ReferenceEtablissementType: {
          ReferenceEtablissement: {
            SigleIdentifiant: 'SIRET',
            Identifiant: sample.company.siret,
            Nom: sample.company.name,
            CodePostal: `${sample.company.postalCode ?? ''} ${sample.company.city ?? ''}`,
            Adresse1: sample.company.address ?? undefined,
            Email: sample.ownerEmail ?? undefined
          }
        },
        DialogueActeurType: {
          DialogueActeur: {
            SigleIdentifiant: 'DEPADM',
            Identifiant: getSenderSachaSigle(sample.department, false),
            Nom: sample.sampler.name ?? ''
          }
        },
        DialogueEchantillonCommemoratifType: [
          {
            DialogueEchantillonComplet: {
              NumeroEchantillon: sampleItem.itemNumber,
              SigleMatriceSpecifique: SigleMatrix[matrix as NotPPVMatrix]!,
              NumeroEtiquette: numeroEtiquette,
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
            SiglePlanAnalyse: siglePlanAnalyse
          },
          ReferencePlanAnalyseContenu: {
            LibelleMatrice: 'Matrice prescrite',
            SigleAnalyte: 'ANAPRS',
            SigleMethodeSpecifique: 'METPRS',
            Depistage: true,
            Confirmation: false,
            Statut: 'V'
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
    if (specificDataKey in specificData) {
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
          sachaCommemoratifRecord[conf.sachaCommemoratifSigle].typeDonnee;

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
              sigle: conf.sachaCommemoratifSigle,
              sigleValue: sigleValue
            });
          }
        } else {
          let textValue: string;
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

export const sendDAIWithEDI = async (
  sample: SampleChecked,
  subPlanNumber: string,
  sampleItem: SampleItem,
  laboratory: LaboratoryWithSacha
): Promise<DaiSentResult> => {
  const [sachaCommemoratifRecord, specificDataRecord, sachaConf] =
    await Promise.all([
      sachaCommemoratifRepository.findAll(),
      specificDataFieldConfigRepository.findSachaFields(),
      sachaConfRepository.get()
    ]);

  const dateNow = Date.now();
  const xmlFile = await generateXMLDAI(
    sample,
    subPlanNumber,
    sampleItem,
    dateNow,
    specificDataRecord,
    sachaCommemoratifRecord,
    sachaConf,
    laboratory
  );

  const xmlDocumentId = await documentService.createDocument(
    new File([xmlFile.content], `${xmlFile.fileName}.xml`, {
      type: 'application/xml'
    }),
    'AnalysisRequestDocument',
    sample.sampler.id,
    (documentId) => Promise.resolve(documentId)
  );

  const sentMethod = await sendSachaFile(xmlFile, dateNow, laboratory);

  return {
    sentMethod,
    documentIds: [xmlDocumentId]
  };
};
