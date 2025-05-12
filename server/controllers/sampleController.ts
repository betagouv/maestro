import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Request, Response } from 'express';
import { AuthenticatedRequest, SampleRequest } from 'express-jwt';
import { constants } from 'http2';
import { isNil, omitBy, pick } from 'lodash-es';
import { getCultureKindLabel } from 'maestro-shared/referential/CultureKind';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { LegalContextLabels } from 'maestro-shared/referential/LegalContext';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { getMatrixPartLabel } from 'maestro-shared/referential/Matrix/MatrixPart';
import { QuantityUnitLabels } from 'maestro-shared/referential/QuantityUnit';
import { Regions } from 'maestro-shared/referential/Region';
import { AnalysisRequestData } from 'maestro-shared/schema/Analysis/AnalysisRequestData';
import {
  getAnalysisReportDocumentFilename,
  getSupportDocumentFilename
} from 'maestro-shared/schema/Document/DocumentKind';
import { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  PartialSample,
  PartialSampleToCreate,
  Sample
} from 'maestro-shared/schema/Sample/Sample';
import { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { DraftStatusList } from 'maestro-shared/schema/Sample/SampleStatus';
import { formatWithTz, isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import companyRepository from '../repositories/companyRepository';
import { laboratoryRepository } from '../repositories/laboratoryRepository';
import prescriptionSubstanceRepository from '../repositories/prescriptionSubstanceRepository';
import sampleItemRepository from '../repositories/sampleItemRepository';
import { sampleRepository } from '../repositories/sampleRepository';
import csvService from '../services/csvService/csvService';
import { documentService } from '../services/documentService';
import { excelService } from '../services/excelService/excelService';
import exportSamplesService from '../services/exportService/exportSamplesService';
import { mailService } from '../services/mailService';
import { pdfService } from '../services/pdfService/pdfService';
import workbookUtils from '../utils/workbookUtils';

import { isEqual } from 'lodash-es';
import UserRoleMissingError from 'maestro-shared/errors/userRoleMissingError';
import { StageLabels } from 'maestro-shared/referential/Stage';
import { Substance } from 'maestro-shared/schema/Substance/Substance';
import {
  hasNationalRole,
  hasPermission
} from 'maestro-shared/schema/User/User';
import { Readable } from 'node:stream';
import { PDFDocument } from 'pdf-lib';
import { laboratoriesConf, LaboratoryWithConf } from '../services/imapService';
const getSample = async (request: Request, response: Response) => {
  const sample = (request as SampleRequest).sample;

  console.info('Get sample', sample.id);

  const sampleItems = await sampleItemRepository.findMany(sample.id);

  response.status(constants.HTTP_STATUS_OK).send({
    ...sample,
    items: sampleItems.map((item) => omitBy(item, isNil))
  });
};

const getSampleDocument = async (request: Request, response: Response) => {
  const sample: Sample = (request as SampleRequest).sample;

  console.info('Get sample document', sample.id);

  const sampleItems = await sampleItemRepository.findMany(sample.id);

  const pdfBuffers = await Promise.all(
    [1, 2, 3].map((itemNumber) =>
      pdfService.generateSampleSupportPDF(
        sample,
        sampleItems,
        itemNumber,
        false
      )
    )
  );

  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBuffer = await mergedPdf.save();
  const pdfBuffer = Buffer.from(mergedPdfBuffer);

  response.setHeader('Content-Type', 'application/pdf');
  response.setHeader(
    'Content-Disposition',
    `inline; filename="Etiquettes-${sample.reference}.pdf"`
  );
  response.send(pdfBuffer);
};

const getSampleItemDocument = async (request: Request, response: Response) => {
  const sample: Sample = (request as SampleRequest).sample;
  const itemNumber = Number(request.params.itemNumber);

  console.info('Get sample document', sample.id);

  const sampleItems = await sampleItemRepository.findMany(sample.id);

  const pdfBuffer = await pdfService.generateSampleSupportPDF(
    sample,
    sampleItems,
    itemNumber,
    true
  );

  response.setHeader('Content-Type', 'application/pdf');
  response.setHeader(
    'Content-Disposition',
    `inline; filename="${getSupportDocumentFilename(sample, itemNumber)}"`
  );
  response.send(pdfBuffer);
};

const findSamples = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const queryFindOptions = FindSampleOptions.parse(request.query);

  const findOptions = {
    ...queryFindOptions,
    region: hasNationalRole(user) ? queryFindOptions.region : user.region
  };

  console.info('Find samples for user', user.id, findOptions);

  const samples = await sampleRepository.findMany(findOptions);

  response.status(constants.HTTP_STATUS_OK).send(samples);
};

const countSamples = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const queryFindOptions = FindSampleOptions.parse(request.query);

  const findOptions = {
    ...queryFindOptions,
    region: hasNationalRole(user) ? queryFindOptions.region : user.region
  };

  console.info('Count samples for user', user.id, findOptions);

  const count = await sampleRepository.count(findOptions);

  response.status(constants.HTTP_STATUS_OK).send({ count });
};

const exportSamples = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const queryFindOptions = FindSampleOptions.parse(request.query);

  const findOptions = {
    ...queryFindOptions,
    region: hasNationalRole(user) ? queryFindOptions.region : user.region
  };

  console.info('Export samples for user', user.id, findOptions);

  const samples = await sampleRepository.findMany(findOptions);

  const fileName = `prelevements-${format(
    new Date(),
    'yyyy-MM-dd-HH-mm-ss'
  )}.xlsx`;

  const workbook = workbookUtils.init(fileName, response);

  await exportSamplesService.writeToWorkbook(samples, workbook);
};

const createSample = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const sampleToCreate = request.body as PartialSampleToCreate;

  console.info('Create sample', sampleToCreate);

  if (!user.region) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  if (sampleToCreate.company) {
    await companyRepository.upsert(sampleToCreate.company);
  }

  const serial = await sampleRepository.getNextSequence(
    user.region,
    new Date().getFullYear()
  );

  const sample = {
    ...sampleToCreate,
    region: user.region,
    reference: `${Regions[user.region].shortName}-${format(new Date(), 'yy')}-${String(serial).padStart(4, '0')}`,
    sampler: pick(user, ['id', 'firstName', 'lastName']),
    createdAt: new Date(),
    lastUpdatedAt: new Date()
  };
  await sampleRepository.insert(sample);

  if (sampleToCreate.items) {
    await sampleItemRepository.insertMany(sampleToCreate.items);
  }

  response.status(constants.HTTP_STATUS_CREATED).send(sample);
};

const updateSample = async (request: Request, response: Response) => {
  const sample = (request as SampleRequest).sample as PartialSample;
  const sampleUpdate = request.body as PartialSample;
  const { user } = request as AuthenticatedRequest;

  console.info('Update sample', sample.id, sampleUpdate);

  if (sample.status !== 'InReview' && sampleUpdate.status === 'InReview') {
    if (!hasPermission(user, 'restoreSampleToReview')) {
      throw new UserRoleMissingError();
    }
  } else if (!hasPermission(user, 'updateSample')) {
    throw new UserRoleMissingError();
  } else if (sample.region !== user.region) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  if (
    sampleUpdate.company?.siret &&
    sample.company?.siret !== sampleUpdate.company?.siret
  ) {
    await companyRepository.upsert(sampleUpdate.company);
  }

  if (sampleUpdate.items) {
    await sampleItemRepository.updateMany(sample.id, sampleUpdate.items);
  }

  if (!isEqual(sample.documentIds, sampleUpdate.documentIds)) {
    await sampleRepository.updateDocumentIds(
      sample.id,
      sampleUpdate.documentIds ?? []
    );
  }

  //TODO update only the fields concerned in relation to the status
  const updatedPartialSample = {
    ...sample,
    ...sampleUpdate,
    lastUpdatedAt: new Date()
  };

  if (sample.status === 'Submitted' && updatedPartialSample.status === 'Sent') {
    const updatedSample = Sample.parse(updatedPartialSample);
    const sampleItems = await sampleItemRepository.findMany(sample.id);

    await Promise.all(
      sampleItems.map(async (sampleItem) => {
        const sampleSupportDoc = await generateAndStoreSampleSupportDocument(
          updatedSample,
          sampleItems as SampleItem[],
          sampleItem.itemNumber
        );

        if (sampleItem.itemNumber === 1) {
          const laboratory = (await laboratoryRepository.findUnique(
            updatedSample.laboratoryId as string
          )) as Laboratory;

          const prescriptionSubstances =
            await prescriptionSubstanceRepository.findMany(
              updatedSample.prescriptionId
            );

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

          const substanceToLaboratorySubstance = (
            substance: Substance
          ): Pick<Substance, 'label'> => {
            let laboratoryLabel: string | null = null;
            if (laboratory.name in laboratoriesConf) {
              const laboratoryName = laboratory.name as LaboratoryWithConf;
              laboratoryLabel =
                Object.entries(
                  laboratoriesConf[laboratoryName].ssd2IdByLabel
                ).find(([_label, value]) => value === substance.code)?.[0] ??
                null;
            }
            return { label: laboratoryLabel ?? substance.label };
          };

          const analysisRequestDocs =
            await generateAndStoreAnalysisRequestDocuments({
              ...updatedSample,
              ...(sampleItem as SampleItem),
              sampler: user,
              company,
              laboratory,
              monoSubstances: prescriptionSubstances
                .filter((substance) => substance.analysisMethod === 'Mono')
                .map(({ substance }) =>
                  substanceToLaboratorySubstance(substance)
                ),
              multiSubstances: prescriptionSubstances
                .filter((substance) => substance.analysisMethod === 'Multi')
                .map(({ substance }) =>
                  substanceToLaboratorySubstance(substance)
                ),
              reference: [updatedSample.reference, sampleItem?.itemNumber]
                .filter(isDefinedAndNotNull)
                .join('-'),
              sampledAt: format(
                updatedSample.sampledAt,
                "eeee dd MMMM yyyy à HH'h'mm",
                {
                  locale: fr
                }
              ),
              sampledAtDate: format(updatedSample.sampledAt, 'dd/MM/yyyy', {
                locale: fr
              }),
              sampledAtTime: formatWithTz(updatedSample.sampledAt, 'HH:mm'),
              context: ContextLabels[updatedSample.context],
              legalContext: LegalContextLabels[updatedSample.legalContext],
              stage: StageLabels[updatedSample.stage],
              matrixKindLabel: MatrixKindLabels[updatedSample.matrixKind],
              matrixLabel: MatrixLabels[updatedSample.matrix],
              matrixPart: getMatrixPartLabel(updatedSample) as string,
              quantityUnit: sampleItem?.quantityUnit
                ? QuantityUnitLabels[sampleItem.quantityUnit]
                : '',
              cultureKind: getCultureKindLabel(updatedSample) as string,
              compliance200263: sampleItem
                ? sampleItem.compliance200263
                  ? 'Respectée'
                  : 'Non respectée'
                : '',
              establishment,
              department: DepartmentLabels[updatedSample.department]
            });

          const sampleDocuments = await Promise.all(
            (updatedSample.documentIds ?? []).map((documentId) =>
              documentService.getDocument(documentId)
            )
          );

          const sampleAttachments = await Promise.all(
            sampleDocuments
              .filter((document) => document !== undefined)
              .map(async (document) => ({
                name: document.filename,
                content: await streamToBase64(document.file as Readable)
              }))
          );

          await mailService.send({
            templateName: 'SampleAnalysisRequestTemplate',
            recipients: laboratory?.emails ?? [],
            params: {
              region: user.region ? Regions[user.region].name : undefined,
              userMail: user.email,
              sampledAt: format(updatedSample.sampledAt, 'dd/MM/yyyy')
            },
            attachment: [
              ...sampleAttachments,
              ...analysisRequestDocs.map((doc) => ({
                name: doc.filename,
                content: Buffer.from(doc.buffer as Buffer).toString('base64')
              })),
              {
                name: `${getSupportDocumentFilename(
                  updatedSample,
                  sampleItem.itemNumber
                )}`,
                content: sampleSupportDoc.toString('base64')
              }
            ]
          });
        }

        if (sample.ownerEmail) {
          await mailService.send({
            templateName: 'SupportDocumentCopyToOwnerTemplate',
            recipients: [sample.ownerEmail],
            params: {
              region: user.region ? Regions[user.region].name : undefined,
              sampledAt: format(updatedSample.sampledAt, 'dd/MM/yyyy')
            },
            attachment: [
              {
                name: `${getSupportDocumentFilename(
                  updatedSample,
                  sampleItem.itemNumber
                )}`,
                content: sampleSupportDoc.toString('base64')
              }
            ]
          });
        }
      })
    );
  }

  await sampleRepository.update(updatedPartialSample);

  response.status(constants.HTTP_STATUS_OK).send(updatedPartialSample);
};

const streamToBase64 = async (stream: Readable): Promise<string> => {
  const chunks: any[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
    stream.on('error', reject);
  });
};

const generateAndStoreSampleSupportDocument = async (
  sample: Sample,
  sampleItems: SampleItem[],
  itemNumber: number
) => {
  const pdfBuffer = await pdfService.generateSampleSupportPDF(
    sample,
    sampleItems,
    itemNumber,
    true
  );

  const sampleItem = sampleItems.find((item) => item.itemNumber === itemNumber);

  if (!sampleItem) {
    throw new Error(`Sample item ${itemNumber} not found`);
  }

  if (sampleItem.supportDocumentId) {
    console.info('Delete previous document', sampleItem.supportDocumentId);
    await sampleItemRepository.update(sample.id, sampleItem.itemNumber, {
      ...sampleItem,
      supportDocumentId: null
    });
    await documentService.deleteDocument(sampleItem.supportDocumentId);
  }

  const file = new File(
    [pdfBuffer],
    getSupportDocumentFilename(sample, sampleItem.itemNumber),
    { type: 'application/pdf' }
  );

  await documentService.createDocument<void>(
    file,
    'SupportDocument',
    sample.sampler.id,
    (documentId, trx) =>
      sampleItemRepository.update(
        sample.id,
        sampleItem.itemNumber,
        {
          ...sampleItem,
          supportDocumentId: documentId
        },
        trx
      )
  );

  return pdfBuffer;
};

const generateAndStoreAnalysisRequestDocuments = async (
  analysisRequestData: AnalysisRequestData
) => {
  const excelBuffer =
    await excelService.generateAnalysisRequestExcel(analysisRequestData);

  const excelFilename = getAnalysisReportDocumentFilename(
    analysisRequestData,
    analysisRequestData.itemNumber,
    'xlsx'
  );

  await documentService.insertDocument(
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
    analysisRequestData.itemNumber,
    'csv'
  );

  await documentService.insertDocument(
    new File(
      [csvBuffer],
      getAnalysisReportDocumentFilename(
        analysisRequestData,
        analysisRequestData.itemNumber,
        'xlsx'
      ),
      { type: 'text/csv' }
    ),
    'SupportDocument',
    analysisRequestData.sampler.id
  );

  return [
    {
      buffer: excelBuffer,
      filename: excelFilename
    },
    {
      buffer: csvBuffer,
      filename: csvFilename
    }
  ];
};

const deleteSample = async (request: Request, response: Response) => {
  const sample = (request as SampleRequest).sample;

  console.info('Delete sample', sample.id);

  if (!DraftStatusList.includes(sample.status)) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  await sampleRepository.deleteOne(sample.id);

  response.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
};

export default {
  getSample,
  getSampleDocument,
  getSampleItemDocument,
  findSamples,
  countSamples,
  exportSamples,
  createSample,
  updateSample,
  deleteSample
};
