import { uniq } from 'lodash-es';
import type { LaboratoryWithSacha } from 'maestro-shared/schema/Laboratory/Laboratory';
import type { MatrixReferential } from 'maestro-shared/schema/Matrix/MatrixReferential';
import type { ProgrammingSubPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type {
  CommemoratifSigle,
  CommemoratifValueSigle,
  SachaCommemoratifRecord
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import {
  type SachaCommemoratifLevel,
  type SachaContext,
  unusableSachaContextMessage
} from 'maestro-shared/schema/SachaContext/SachaContext';
import type { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import type { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import type { SachaFieldConfig } from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import type { SpecificData } from 'maestro-shared/schema/SpecificData/SpecificData';
import { isDefined } from 'maestro-shared/utils/utils';
import type { SachaConf } from '../../repositories/kysely.type';
import { matrixRepository } from '../../repositories/matrixRepository';
import { sachaCommemoratifRepository } from '../../repositories/sachaCommemoratifRepository';
import { sachaConfRepository } from '../../repositories/sachaConfRepository';
import { sachaContextRepository } from '../../repositories/sachaContextRepository';
import { specificDataFieldConfigRepository } from '../../repositories/specificDataFieldConfigRepository';
import type { DaiSentResult } from '../daiSendingService';
import { documentService } from '../documentService';
import { referencesFromSample, SampleReference } from './sachaReferences';
import { SiglePlanAnalyse } from './sachaReferential';
import { sendSachaFile } from './sachaSender';
import { generateXML, getSenderSachaSigle, type XmlFile } from './sachaToXML';
import { toSachaDateTime } from './sachaValidator';

const referenceEtablissementType = (
  sample: Pick<SampleChecked, 'company' | 'companyWorkshop' | 'ownerEmail'>
) => {
  const workshop = sample.companyWorkshop;

  if (!workshop?.typeIdentEta || !workshop.etaId || !workshop.etaLb) {
    return {
      ReferenceEtablissement: {
        SigleIdentifiant: 'SIRET',
        Identifiant: sample.company.siret,
        Nom: sample.company.name,
        CodePostal: `${sample.company.postalCode ?? ''} ${sample.company.city ?? ''}`,
        Adresse1: sample.company.address ?? undefined,
        Email: sample.ownerEmail ?? undefined
      }
    };
  }

  const codePostal = [workshop.cpEtab, workshop.communeEtab]
    .filter(isDefined)
    .join(' ');

  return {
    ReferenceEtablissement: {
      SigleIdentifiant: workshop.typeIdentEta,
      Identifiant: workshop.etaId,
      Nom: workshop.etaLb,
      Adresse1: workshop.adrLigne1 ?? undefined,
      CodePostal: codePostal,
      Email: sample.ownerEmail ?? undefined
    },
    ReferenceAtelierType: {
      ReferenceAtelier: {
        SigleIdentifiant: workshop.ideLb ?? '',
        Identifiant: workshop.ateIdentifiant,
        Nom: workshop.ateLb,
        Adresse1: workshop.adrLigne1 ?? undefined,
        CodePostal: codePostal
      }
    }
  };
};

export const generateXMLDAI = (
  matrixReferential: MatrixReferential,
  sample: Pick<
    SampleChecked,
    | 'specificData'
    | 'sampledDate'
    | 'lastUpdatedAt'
    | 'company'
    | 'companyWorkshop'
    | 'ownerEmail'
    | 'sampler'
    | 'department'
    | 'matrices'
    | 'reference'
    | 'sentAt'
  >,
  subPlan: Pick<ProgrammingSubPlan, 'subPlanNumber' | 'sachaContextSigle'>,
  sampleItem: Pick<
    SampleItem,
    'sealId' | 'itemNumber' | 'copyNumber' | 'substanceKinds'
  >,
  dateNow: number,
  sachaFieldConfigs: SachaFieldConfig[],
  sachaCommemoratifRecord: SachaCommemoratifRecord,
  sachaContext: SachaContext | undefined,
  sachaConf: SachaConf,
  laboratory: LaboratoryWithSacha,
  withSacha = true
): Promise<XmlFile> => {
  if (!withSacha) {
    throw new Error(`Pas d'EDI Sacha pour ${subPlan.subPlanNumber}`);
  }

  const { sachaContextSigle } = subPlan;
  if (!sachaContextSigle) {
    throw new Error(
      `Pas de contexte d'intervention SIGAL pour le sous-plan ${subPlan.subPlanNumber}.`
    );
  }
  if (!sachaContext || sachaContext.sigle !== sachaContextSigle) {
    throw new Error(unusableSachaContextMessage(sachaContextSigle));
  }

  const siglesMatrice = sample.matrices.map(({ matrix }) => {
    const sigle = matrixReferential.matrices.find(
      ({ code }) => code === matrix
    )?.sachaSigle;
    if (!sigle) {
      throw new Error(`Pas de Sigle SACHA associé à la matrice ${matrix}.`);
    }
    return sigle;
  });
  const duplicatedSigle = siglesMatrice.find(
    (sigle, index) => siglesMatrice.indexOf(sigle) !== index
  );
  if (duplicatedSigle) {
    throw new Error(
      `Plusieurs matrices avec le même sigle SACHA (${duplicatedSigle}) : non supporté par l’EDI Sacha.`
    );
  }

  const siglesPlanAnalyse = uniq(
    sampleItem.substanceKinds.map(
      (substanceKind) => SiglePlanAnalyse[substanceKind]
    )
  );
  if (!siglesPlanAnalyse.every(isDefined)) {
    throw new Error("Pas de plan d'analyse de configuré.");
  }

  const commemoratifs = getCommemoratifs(
    sample.specificData,
    sachaFieldConfigs,
    sachaCommemoratifRecord,
    sachaContext
  );
  const dialogueCommemoratifs = (level: SachaCommemoratifLevel) =>
    commemoratifs
      .filter((c) => c.level === level)
      .map((c) =>
        'sigleValue' in c
          ? { Sigle: c.sigle, SigleValeur: c.sigleValue }
          : { Sigle: c.sigle, TexteValeur: c.textValue }
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
          SigleContexteIntervention: sachaContextSigle,
          DateIntervention: sample.sampledDate,
          DateModification: toSachaDateTime(sample.lastUpdatedAt)
        },
        DialogueCommemoratif: dialogueCommemoratifs('Sample'),
        ReferenceEtablissementType: referenceEtablissementType(sample),
        DialogueActeurType: {
          DialogueActeur: {
            SigleIdentifiant: 'DEPADM',
            Identifiant: getSenderSachaSigle(sample.department, false),
            Nom: sample.sampler.name ?? ''
          }
        },
        DialogueEchantillonCommemoratifType: siglesMatrice.map(
          (sigleMatrice, index) => ({
            DialogueEchantillonComplet: {
              NumeroEchantillon: index + 1,
              SigleMatriceSpecifique: sigleMatrice,
              NumeroEtiquette: numeroEtiquette,
              Commentaire: sampleItem.sealId ?? ''
            },
            DialogueCommemoratif: dialogueCommemoratifs('SampleMatrix')
          })
        ),
        ReferencePlanAnalyseType: siglesPlanAnalyse.map((siglePlanAnalyse) => ({
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
        }))
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
  sachaCommemoratifRecord: SachaCommemoratifRecord,
  sachaContext: SachaContext
): ({ sigle: CommemoratifSigle; level: SachaCommemoratifLevel } & (
  | { textValue: string }
  | { sigleValue: CommemoratifValueSigle }
))[] => {
  const commemoratifs: ReturnType<typeof getCommemoratifs> = [];
  for (const specificDataKey of Object.keys(specificData)) {
    const conf = sachaFieldConfigs.find((fc) => fc.key === specificDataKey);
    if (conf === undefined) {
      throw new Error(`Configuration SACHA incomplète: ${specificDataKey}`);
    }

    const sigle = conf.sachaCommemoratifSigle;
    const level = sachaContext.commemoratifs.find(
      (commemoratif) => commemoratif.sigle === sigle
    )?.level;
    const commemoratif = sigle ? sachaCommemoratifRecord[sigle] : undefined;
    if (!sigle || !level || !commemoratif) {
      continue;
    }

    const rawValue = specificData[specificDataKey];
    const specificDataValues = (
      Array.isArray(rawValue) ? rawValue : [rawValue]
    ) as string[];

    for (const specificDataValue of specificDataValues) {
      if (commemoratif.typeDonnee === 'list') {
        const sigleValue =
          conf.options.find((o) => o.value === specificDataValue)
            ?.sachaCommemoratifValueSigle ?? null;
        if (!sigleValue || !commemoratif.values[sigleValue]) {
          throw new Error(
            `Configuration SACHA incomplète: ${specificDataKey} ${specificDataValue}`
          );
        } else {
          commemoratifs.push({ sigle, level, sigleValue });
        }
      } else {
        const textValue =
          commemoratif.typeDonnee === 'date'
            ? toSachaDateTime(new Date(specificDataValue))
            : `${specificDataValue}`;
        commemoratifs.push({ sigle, level, textValue });
      }
    }
  }
  return commemoratifs;
};

export const sendDAIWithEDI = async (
  sample: SampleChecked,
  subPlan: Pick<ProgrammingSubPlan, 'subPlanNumber' | 'sachaContextSigle'>,
  sampleItem: SampleItem,
  laboratory: LaboratoryWithSacha
): Promise<DaiSentResult> => {
  const [
    matrixReferential,
    sachaCommemoratifRecord,
    specificDataRecord,
    sachaContext,
    sachaConf
  ] = await Promise.all([
    matrixRepository.findReferential(),
    sachaCommemoratifRepository.findAll(),
    specificDataFieldConfigRepository.findSachaFields(),
    subPlan.sachaContextSigle
      ? sachaContextRepository.findUsableBySigle(subPlan.sachaContextSigle)
      : undefined,
    sachaConfRepository.get()
  ]);

  const dateNow = Date.now();
  const xmlFile = await generateXMLDAI(
    matrixReferential,
    sample,
    subPlan,
    sampleItem,
    dateNow,
    specificDataRecord,
    sachaCommemoratifRecord,
    sachaContext,
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
