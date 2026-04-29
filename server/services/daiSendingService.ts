import type { Readable } from 'node:stream';
import { isNil } from 'lodash-es';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { LegalContextLabels } from 'maestro-shared/referential/LegalContext';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { QuantityUnitLabels } from 'maestro-shared/referential/QuantityUnit';
import { Regions } from 'maestro-shared/referential/Region';
import type { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { StageLabels } from 'maestro-shared/referential/Stage';
import type { AnalysisRequestData } from 'maestro-shared/schema/Analysis/AnalysisRequestData';
import { getAnalysisReportDocumentFilename } from 'maestro-shared/schema/Document/DocumentKind';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import type { SachaCommunicationMethod } from 'maestro-shared/schema/Laboratory/SachaCommunicationMethod';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  getSampleMatrixLabel,
  type SampleChecked
} from 'maestro-shared/schema/Sample/Sample';
import {
  getSampleItemReference,
  type SampleItem
} from 'maestro-shared/schema/Sample/SampleItem';
import { getFieldValueLabel } from 'maestro-shared/schema/SpecificData/getFieldValueLabel';
import type { PlanKindFieldConfig } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import type { UserBase } from 'maestro-shared/schema/User/User';
import { formatMaestroDate } from 'maestro-shared/utils/date';
import type { LaboratoryResidueMapping } from '../repositories/kysely.type';
import { laboratoryResidueMappingRepository } from '../repositories/laboratoryResidueMappingRepository';
import { specificDataFieldConfigRepository } from '../repositories/specificDataFieldConfigRepository';
import { userRepository } from '../repositories/userRepository';
import { csvService } from './csvService/csvService';
import { documentService } from './documentService';
export type DaiSentResult = {
  sentMethod: SachaCommunicationMethod;
  documentIds: string[];
};

import { excelService } from './excelService/excelService';
import { type LaboratoryWithConf, laboratoriesConf } from './imapService';
import { mailService } from './mailService';

const streamToBase64 = async (stream: Readable): Promise<string> => {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
    stream.on('error', reject);
  });
};

export const buildAnalysisRequestData = (
  updatedSample: SampleChecked,
  sampleItem: SampleItem,
  sampler: UserBase,
  laboratory: Laboratory,
  laboratoryResiduesMapping: LaboratoryResidueMapping[],
  planKindFieldConfigs: PlanKindFieldConfig[]
): AnalysisRequestData => {
  const matrixPartField = planKindFieldConfigs.find(
    (c) => c.field.key === 'matrixPart'
  )?.field;
  const cultureKindField = planKindFieldConfigs.find(
    (c) => c.field.key === 'cultureKind'
  )?.field;
  const establishment = {
    name: Regions[updatedSample.region].establishment.name,
    fullAddress: [
      Regions[updatedSample.region].establishment.additionalAddress,
      Regions[updatedSample.region].establishment.street,
      `${Regions[updatedSample.region].establishment.postalCode} ${Regions[updatedSample.region].establishment.city}`
    ]
      .filter(Boolean)
      .join('\n')
  };

  const company = {
    ...updatedSample.company,
    fullAddress: [
      updatedSample.company.address,
      `${updatedSample.company.postalCode} ${updatedSample.company.city}`
    ].join('\n')
  };

  const substanceToLaboratoryLabel = (substance: SSD2Id): string => {
    const laboratoryLabel =
      laboratoryResiduesMapping.find(({ ssd2Id }) => ssd2Id === substance)
        ?.label ?? null;
    return laboratoryLabel ?? SSD2IdLabel[substance];
  };

  return {
    ...updatedSample,
    ...sampleItem,
    reference: getSampleItemReference(
      updatedSample,
      sampleItem.itemNumber,
      sampleItem.copyNumber
    ),
    sampler,
    company,
    laboratory,
    monoSubstanceLabels: (updatedSample.monoSubstances ?? []).map(
      substanceToLaboratoryLabel
    ),
    multiSubstanceLabels: (updatedSample.multiSubstances ?? []).map(
      substanceToLaboratoryLabel
    ),
    sampledDate: formatMaestroDate(updatedSample.sampledDate),
    sampledTime: updatedSample.sampledTime,
    context: ContextLabels[updatedSample.context],
    legalContext: LegalContextLabels[updatedSample.legalContext],
    stage: StageLabels[updatedSample.stage],
    matrixKindLabel: MatrixKindLabels[updatedSample.matrixKind],
    matrixLabel: getSampleMatrixLabel(updatedSample),
    matrixPart: matrixPartField
      ? (getFieldValueLabel(
          matrixPartField,
          updatedSample.specificData['matrixPart']
        ) ?? '')
      : '',
    quantityUnit: sampleItem.quantityUnit
      ? QuantityUnitLabels[sampleItem.quantityUnit]
      : '',
    cultureKind: cultureKindField
      ? (getFieldValueLabel(
          cultureKindField,
          updatedSample.specificData['cultureKind']
        ) ?? '')
      : '',
    compliance200263: sampleItem.compliance200263
      ? 'Respectée'
      : 'Non respectée',
    establishment,
    department: DepartmentLabels[updatedSample.department]
  };
};

const generateAndStoreAnalysisRequestDocuments = async (
  analysisRequestData: AnalysisRequestData
): Promise<
  {
    buffer: Buffer | ArrayBuffer | null;
    filename: string;
    documentId: string;
  }[]
> => {
  const excelBuffer =
    await excelService.generateAnalysisRequestExcel(analysisRequestData);

  const excelFilename = getAnalysisReportDocumentFilename(
    analysisRequestData,
    'xlsx'
  );

  const excelDocumentId = await documentService.insertDocument(
    new File([new Uint8Array(excelBuffer as Buffer)], excelFilename, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }),
    'SupportDocument',
    analysisRequestData.sampler.id
  );

  const csvBuffer =
    await csvService.generateAnalysisRequestCsv(analysisRequestData);

  const csvFilename = getAnalysisReportDocumentFilename(
    analysisRequestData,
    'csv'
  );

  const csvDocumentId = await documentService.insertDocument(
    new File([csvBuffer], csvFilename, { type: 'text/csv' }),
    'SupportDocument',
    analysisRequestData.sampler.id
  );

  return [
    {
      buffer: excelBuffer,
      filename: excelFilename,
      documentId: excelDocumentId
    },
    { buffer: csvBuffer, filename: csvFilename, documentId: csvDocumentId }
  ];
};

export class DaiProcessingError extends Error {
  constructor(
    message: string,
    public readonly edi: boolean | null,
    public readonly sentMethod: SachaCommunicationMethod | null = null
  ) {
    super(message);
    this.name = 'DaiProcessingError';
  }
}

export const sendDAIWithoutEDI = async (
  sample: SampleChecked,
  sampleItem: SampleItem,
  laboratory: Laboratory
): Promise<DaiSentResult> => {
  if (!laboratory.emails.length) {
    throw new DaiProcessingError(
      `Aucun email configuré pour le laboratoire ${laboratory.name}`,
      false,
      'EMAIL'
    );
  }

  let laboratoryResiduesMappings: LaboratoryResidueMapping[] = [];
  if (laboratory.shortName in laboratoriesConf) {
    laboratoryResiduesMappings =
      await laboratoryResidueMappingRepository.findByLaboratoryShortName(
        laboratory.shortName as LaboratoryWithConf
      );
  }

  const planKindFieldConfigs =
    await specificDataFieldConfigRepository.findByPlanKind(
      sample.programmingPlanId,
      sample.programmingPlanKind
    );

  const sampler = await userRepository.findUnique(sample.sampler.id);
  if (!sampler) {
    throw new DaiProcessingError(
      `Sampler ${sample.sampler.id} introuvable`,
      false,
      'EMAIL'
    );
  }

  const sampleSupportDoc = sampleItem.supportDocumentId
    ? await documentService.getDocument(sampleItem.supportDocumentId)
    : null;

  const sampleSupportAttachment = sampleSupportDoc
    ? {
        name: sampleSupportDoc.filename,
        content: await streamToBase64(sampleSupportDoc.file as Readable)
      }
    : null;

  const analysisRequestDocs = await generateAndStoreAnalysisRequestDocuments(
    buildAnalysisRequestData(
      sample,
      sampleItem,
      sampler,
      laboratory,
      laboratoryResiduesMappings,
      planKindFieldConfigs
    )
  );

  const sampleDocuments = await Promise.all(
    (sample.documentIds ?? []).map((docId) =>
      documentService.getDocument(docId)
    )
  );

  const sampleAttachments = await Promise.all(
    sampleDocuments
      .filter((doc) => doc !== undefined)
      .map(async (doc) => ({
        name: doc.filename,
        content: await streamToBase64(doc.file as Readable)
      }))
  );

  await mailService.send({
    templateName: 'SampleAnalysisRequestTemplate',
    recipients: laboratory.emails,
    params: {
      region: sample.region ? Regions[sample.region].name : undefined,
      userMail: sampler.email,
      sampledAt: formatMaestroDate(sample.sampledDate)
    },
    attachment: [
      ...sampleAttachments,
      ...analysisRequestDocs
        .filter((doc) => !isNil(doc.buffer))
        .map((doc) => ({
          name: doc.filename,
          content: Buffer.from(doc.buffer as Buffer).toString('base64')
        })),
      sampleSupportAttachment
    ].filter((a) => !isNil(a))
  });

  const collectedDocumentIds = [
    ...analysisRequestDocs.map((d) => d.documentId),
    ...(sample.documentIds ?? []),
    ...(sampleItem.supportDocumentId ? [sampleItem.supportDocumentId] : [])
  ];

  return {
    sentMethod: 'EMAIL',
    documentIds: collectedDocumentIds
  };
};
