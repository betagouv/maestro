import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Request, Response } from 'express';
import { AuthenticatedRequest, SampleRequest } from 'express-jwt';
import { constants } from 'http2';
import { isNil, omitBy } from 'lodash-es';
import { getCultureKindLabel } from 'maestro-shared/referential/CultureKind';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { LegalContextLabels } from 'maestro-shared/referential/LegalContext';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { getMatrixPartLabel } from 'maestro-shared/referential/Matrix/MatrixPart';
import { QuantityUnitLabels } from 'maestro-shared/referential/QuantityUnit';
import { Regions } from 'maestro-shared/referential/Region';
import { AnalysisRequestData } from 'maestro-shared/schema/Analysis/AnalysisRequestData';
import {
  getAnalysisReportDocumentFilename,
  getSupportDocumentFilename
} from 'maestro-shared/schema/Document/DocumentKind';
import { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import {
  ContextLabels,
  ProgrammingPlanContext
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  getSampleMatrixLabel,
  isProgrammingPlanSample,
  PartialSample,
  PartialSampleToCreate,
  Sample
} from 'maestro-shared/schema/Sample/Sample';
import { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { DraftStatusList } from 'maestro-shared/schema/Sample/SampleStatus';
import { formatWithTz, isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import companyRepository from '../repositories/companyRepository';
import { laboratoryRepository } from '../repositories/laboratoryRepository';
import sampleItemRepository from '../repositories/sampleItemRepository';
import { sampleRepository } from '../repositories/sampleRepository';
import csvService from '../services/csvService/csvService';
import { documentService } from '../services/documentService';
import { excelService } from '../services/excelService/excelService';
import { mailService } from '../services/mailService';
import { pdfService } from '../services/pdfService/pdfService';

import { isEqual } from 'lodash-es';
import UserRoleMissingError from 'maestro-shared/errors/userRoleMissingError';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { StageLabels } from 'maestro-shared/referential/Stage';
import {
  hasNationalRole,
  hasPermission
} from 'maestro-shared/schema/User/User';
import { Readable } from 'node:stream';
import { PDFDocument } from 'pdf-lib';
import {
  getAndCheckSample,
  getAndCheckSampleDepartement
} from '../middlewares/checks/sampleCheck';
import prescriptionRepository from '../repositories/prescriptionRepository';
import prescriptionSubstanceRepository from '../repositories/prescriptionSubstanceRepository';
import regionalPrescriptionRepository from '../repositories/regionalPrescriptionRepository';
import { SubRouter } from '../routers/routes.type';
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
  )}.xls`;

  const buffer = await excelService.generateSamplesExportExcel(samples);

  response.header(
    'Content-disposition',
    `inline; filename=${encodeURIComponent(fileName)}`
  );
  response.header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  response.header('Content-Length', `${buffer.length}`);
  response.end(buffer);
};

const createSample = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const sampleToCreate = request.body as PartialSampleToCreate;

  console.info('Create sample', sampleToCreate);

  if (!user.region) {
    return response
      .status(constants.HTTP_STATUS_FORBIDDEN)
      .send(`Vous n'êtes associé à aucune région.`);
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
    createdAt: new Date(),
    lastUpdatedAt: new Date()
  };
  await sampleRepository.insert(sample);

  if (sampleToCreate.items) {
    await sampleItemRepository.insertMany(sampleToCreate.items);
  }

  response.status(constants.HTTP_STATUS_CREATED).send(sample);
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

export const sampleRou = {
  '/samples/:sampleId': {
    get: async ({ user }, { sampleId }) => {
      const sample = await getAndCheckSample(sampleId, user);
      console.info('Get sample', sample.id);

      const sampleItems = await sampleItemRepository.findMany(sample.id);

      return {
        status: constants.HTTP_STATUS_OK,
        response: {
          ...sample,
          items: sampleItems.map((item) => omitBy(item, isNil))
        }
      };
    },
    put: async ({ body: sampleUpdate, user }, { sampleId }) => {
      const sample = await getAndCheckSample(sampleId, user);
      console.info('Update sample', sample.id, sampleUpdate);

      sampleUpdate.department = await getAndCheckSampleDepartement(
        sampleUpdate,
        user
      );

      if (sample.status !== 'InReview' && sampleUpdate.status === 'InReview') {
        if (!hasPermission(user, 'restoreSampleToReview')) {
          throw new UserRoleMissingError();
        }
      } else if (!hasPermission(user, 'updateSample')) {
        throw new UserRoleMissingError();
      } else if (sample.region !== user.region) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      const prescription =
        isProgrammingPlanSample(sampleUpdate) &&
        !isNil(sampleUpdate.context) &&
        !isNil(sampleUpdate.matrixKind) &&
        !isNil(sampleUpdate.stage)
          ? await prescriptionRepository
              .findMany({
                programmingPlanId: sampleUpdate.programmingPlanId,
                context: sampleUpdate.context as ProgrammingPlanContext,
                matrixKind: sampleUpdate.matrixKind,
                stage: sampleUpdate.stage
              })
              .then((_) => _?.[0])
          : undefined;

      const regionalPrescription = prescription
        ? await regionalPrescriptionRepository.findUnique({
            prescriptionId: prescription.id,
            region: sampleUpdate.region
          })
        : undefined;

      const prescriptionSubstances = prescription
        ? await prescriptionSubstanceRepository.findMany(prescription.id)
        : undefined;

      const prescriptionData: Pick<
        PartialSample,
        'prescriptionId' | 'laboratoryId' | 'monoSubstances' | 'multiSubstances'
      > =
        isProgrammingPlanSample(sampleUpdate) ||
        sample.context !== sampleUpdate.context
          ? {
              prescriptionId: prescription?.id || null,
              laboratoryId: regionalPrescription?.laboratoryId || null,
              monoSubstances:
                prescriptionSubstances
                  ?.filter((substance) => substance.analysisMethod === 'Mono')
                  .map((_) => _.substance) || null,
              multiSubstances:
                prescriptionSubstances
                  ?.filter((substance) => substance.analysisMethod === 'Multi')
                  .map((_) => _.substance) || null
            }
          : sampleUpdate;

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

      const mustBeSent =
        sample.status === 'Submitted' && sampleUpdate.status === 'Sent';

      const updatedPartialSample = {
        ...sample,
        ...sampleUpdate,
        ...prescriptionData,
        lastUpdatedAt: new Date(),
        sentAt: mustBeSent ? new Date() : sample.sentAt
      };

      if (mustBeSent) {
        const updatedSample = Sample.parse(updatedPartialSample);
        const sampleItems = await sampleItemRepository.findMany(sample.id);

        await Promise.all(
          sampleItems.map(async (sampleItem) => {
            const sampleSupportDoc =
              await generateAndStoreSampleSupportDocument(
                updatedSample,
                sampleItems as SampleItem[],
                sampleItem.itemNumber
              );

            if (sampleItem.itemNumber === 1) {
              const laboratory = (await laboratoryRepository.findUnique(
                updatedSample.laboratoryId as string
              )) as Laboratory;

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

              const substanceToLaboratoryLabel = (
                substance: SSD2Id
              ): string => {
                let laboratoryLabel: string | null = null;
                if (laboratory.name in laboratoriesConf) {
                  const laboratoryName = laboratory.name as LaboratoryWithConf;
                  laboratoryLabel =
                    Object.entries(
                      laboratoriesConf[laboratoryName].ssd2IdByLabel
                    ).find(([_label, value]) => value === substance)?.[0] ??
                    null;
                }
                return laboratoryLabel ?? SSD2IdLabel[substance];
              };

              const analysisRequestDocs =
                await generateAndStoreAnalysisRequestDocuments({
                  ...updatedSample,
                  ...(sampleItem as SampleItem),
                  sampler: user,
                  company,
                  laboratory,
                  monoSubstanceLabels: (updatedSample.monoSubstances ?? []).map(
                    (substance) => substanceToLaboratoryLabel(substance)
                  ),
                  multiSubstanceLabels: (
                    updatedSample.multiSubstances ?? []
                  ).map((substance) => substanceToLaboratoryLabel(substance)),
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
                  matrixLabel: getSampleMatrixLabel(updatedSample),
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
                  ...analysisRequestDocs
                    .filter((doc) => !isNil(doc.buffer))
                    .map((doc) => ({
                      name: doc.filename,
                      content: Buffer.from(doc.buffer as Buffer).toString(
                        'base64'
                      )
                    })),
                  sampleSupportDoc
                    ? {
                        name: `${getSupportDocumentFilename(
                          updatedSample,
                          sampleItem.itemNumber
                        )}`,
                        content: sampleSupportDoc.toString('base64')
                      }
                    : undefined
                ].filter((_) => !isNil(_))
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

      return {
        status: constants.HTTP_STATUS_OK,
        response: updatedPartialSample
      };
    }
  }
} as const satisfies SubRouter;

export default {
  getSample,
  getSampleDocument,
  getSampleItemDocument,
  findSamples,
  countSamples,
  exportSamples,
  createSample,
  deleteSample
};
