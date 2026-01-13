import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { constants } from 'http2';
import { isNil } from 'lodash-es';
import { getCultureKindLabel } from 'maestro-shared/referential/CultureKind';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { LegalContextLabels } from 'maestro-shared/referential/LegalContext';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { getMatrixPartLabel } from 'maestro-shared/referential/Matrix/MatrixPart';
import { QuantityUnitLabels } from 'maestro-shared/referential/QuantityUnit';
import { Region, Regions } from 'maestro-shared/referential/Region';
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
import {
  getSampleMatrixLabel,
  isProgrammingPlanSample,
  PartialSample,
  Sample,
  SampleBase,
  sampleSendCheck
} from 'maestro-shared/schema/Sample/Sample';
import {
  SampleItem,
  SampleItemMaxCopyCount,
  SampleItemSort
} from 'maestro-shared/schema/Sample/SampleItem';
import { DraftStatusList } from 'maestro-shared/schema/Sample/SampleStatus';
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import companyRepository from '../repositories/companyRepository';
import { laboratoryRepository } from '../repositories/laboratoryRepository';
import sampleItemRepository from '../repositories/sampleItemRepository';
import { sampleRepository } from '../repositories/sampleRepository';
import { csvService } from '../services/csvService/csvService';
import { documentService } from '../services/documentService';
import { excelService } from '../services/excelService/excelService';
import { mailService } from '../services/mailService';
import { pdfService } from '../services/pdfService/pdfService';

import { isEqual } from 'lodash-es';
import NoRegionError from 'maestro-shared/errors/noRegionError';
import UserRoleMissingError from 'maestro-shared/errors/userRoleMissingError';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { StageLabels } from 'maestro-shared/referential/Stage';
import { hasPermission } from 'maestro-shared/schema/User/User';
import { isNationalRole } from 'maestro-shared/schema/User/UserRole';
import { formatWithTz } from 'maestro-shared/utils/date';
import { Readable } from 'node:stream';
import { PDFDocument } from 'pdf-lib';
import { getAndCheckProgrammingPlan } from '../middlewares/checks/programmingPlanCheck';
import {
  getAndCheckSample,
  getAndCheckSampleDepartement
} from '../middlewares/checks/sampleCheck';
import prescriptionRepository from '../repositories/prescriptionRepository';
import prescriptionSubstanceRepository from '../repositories/prescriptionSubstanceRepository';
import { ProtectedSubRouter } from '../routers/routes.type';
import { laboratoriesConf, LaboratoryWithConf } from '../services/imapService';

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
  itemNumber: number,
  copyNumber: number
) => {
  const pdfBuffer = await pdfService.generateSampleSupportPDF(
    sample,
    sampleItems,
    itemNumber,
    copyNumber,
    true
  );

  const sampleItem = sampleItems.find(
    (item) => item.itemNumber === itemNumber && item.copyNumber === copyNumber
  );

  if (!sampleItem) {
    throw new Error(`Sample item ${copyNumber} not found`);
  }

  if (sampleItem.supportDocumentId) {
    console.info('Delete previous document', sampleItem.supportDocumentId);
    await sampleItemRepository.update(
      sample.id,
      sampleItem.itemNumber,
      sampleItem.copyNumber,
      {
        ...sampleItem,
        supportDocumentId: null
      }
    );
    await documentService.deleteDocument(sampleItem.supportDocumentId);
  }

  const file = new File(
    [pdfBuffer],
    getSupportDocumentFilename(
      sample,
      sampleItem.itemNumber,
      sampleItem.copyNumber
    ),
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
        sampleItem.copyNumber,
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
    analysisRequestData.copyNumber,
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
    analysisRequestData.copyNumber,
    'csv'
  );

  await documentService.insertDocument(
    new File(
      [csvBuffer],
      getAnalysisReportDocumentFilename(
        analysisRequestData,
        analysisRequestData.itemNumber,
        analysisRequestData.copyNumber,
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

/**
 * à partir de 2026 le numéro devient unique pour toute la France (alors qu'avant c'était par région)
 * et il passe sur 5 digits
 */
export const getNewReference = async (
  region: Region,
  currentYear: number
): Promise<string> => {
  //TODO à simplifier en 2026, idem en bdd
  const serial = await sampleRepository.getNextSequence(
    currentYear < 2026 ? region : '01',
    currentYear
  );

  return `${Regions[region].shortName}-${currentYear - 2000}-${String(serial).padStart(currentYear < 2026 ? 4 : 5, '0')}`;
};

export const sampleRouter = {
  '/samples': {
    get: async ({ user, userRole, query }) => {
      const findOptions = {
        ...query,
        region: isNationalRole(userRole) ? query.region : user.region
      };

      console.info('Find samples for user', user.id, findOptions);

      const samples = await sampleRepository.findMany(findOptions);

      return { status: constants.HTTP_STATUS_OK, response: samples };
    },
    post: async ({ user, userRole, body: sampleToCreate }) => {
      console.info('Create sample', sampleToCreate);
      sampleToCreate.department = await getAndCheckSampleDepartement(
        sampleToCreate,
        user,
        userRole
      );

      if (!user.region) {
        throw new NoRegionError();
      }

      if (sampleToCreate.company) {
        await companyRepository.upsert(sampleToCreate.company);
      }

      const reference = await getNewReference(
        user.region,
        new Date().getFullYear()
      );

      const sample = {
        ...sampleToCreate,
        region: user.region,
        reference,
        createdAt: new Date(),
        lastUpdatedAt: new Date()
      };
      await sampleRepository.insert(sample);

      if (sampleToCreate.items) {
        await sampleItemRepository.insertMany(sampleToCreate.items);
      }

      return { status: constants.HTTP_STATUS_CREATED, response: sample };
    }
  },
  '/samples/count': {
    get: async ({ user, userRole, query: queryFindOptions }) => {
      const findOptions = {
        ...queryFindOptions,
        region: isNationalRole(userRole) ? queryFindOptions.region : user.region
      };

      console.info('Count samples for user', user.id, findOptions);

      const count = await sampleRepository.count(findOptions);

      return { status: constants.HTTP_STATUS_OK, response: { count } };
    }
  },
  '/samples/export': {
    get: async (
      { user, userRole, query: queryFindOptions },
      _params,
      { setHeader }
    ) => {
      const findOptions = {
        ...queryFindOptions,
        region: isNationalRole(userRole) ? queryFindOptions.region : user.region
      };

      console.info('Export samples for user', user.id, findOptions);

      const samples = await sampleRepository.findMany(findOptions);

      const fileName = `prelevements-${format(
        new Date(),
        'yyyy-MM-dd-HH-mm-ss'
      )}.xls`;

      const buffer = await excelService.generateSamplesExportExcel(samples);

      setHeader(
        'Content-disposition',
        `inline; filename=${encodeURIComponent(fileName)}`
      );
      setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      setHeader('Content-Length', `${buffer.length}`);
      return { status: constants.HTTP_STATUS_OK, response: buffer };
    }
  },
  '/samples/:sampleId/document': {
    get: async ({ user, userRole }, { sampleId }, { setHeader }) => {
      const sample = await getAndCheckSample(sampleId, user, userRole);
      const programmingPlan = await getAndCheckProgrammingPlan(
        sample.programmingPlanId
      );
      console.info('Get sample document', sample.id);

      const sampleItems = await sampleItemRepository.findMany(sample.id);

      const pdfBuffers = await Promise.all(
        (sampleItems?.length
          ? [...sampleItems].sort(SampleItemSort)
          : Array.from(
              Array(programmingPlan.substanceKinds.length).keys()
            ).flatMap((itemNumber) =>
              Array.from(Array(SampleItemMaxCopyCount).keys()).map(
                (copyNumber) => ({
                  itemNumber: itemNumber + 1,
                  copyNumber: copyNumber + 1
                })
              )
            )
        ).map(({ itemNumber, copyNumber }) =>
          pdfService.generateSampleSupportPDF(
            sample,
            sampleItems,
            itemNumber,
            copyNumber,
            false
          )
        )
      );

      const mergedPdf = await PDFDocument.create();

      for (const buffer of pdfBuffers) {
        const pdf = await PDFDocument.load(buffer);
        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBuffer = await mergedPdf.save();
      const pdfBuffer = Buffer.from(mergedPdfBuffer);

      setHeader('Content-Type', 'application/pdf');
      setHeader(
        'Content-Disposition',
        `inline; filename="Etiquettes-${sample.reference}.pdf"`
      );
      return { status: constants.HTTP_STATUS_OK, response: pdfBuffer };
    }
  },
  '/samples/:sampleId/items/:itemNumber/copy/:copyNumber/document': {
    get: async (
      { user, userRole },
      { sampleId, itemNumber, copyNumber },
      { setHeader }
    ) => {
      const sample = await getAndCheckSample(sampleId, user, userRole);

      console.info('Get sample document', sample.id);

      const sampleItems = await sampleItemRepository.findMany(sample.id);

      const pdfBuffer = await pdfService.generateSampleSupportPDF(
        sample,
        sampleItems,
        itemNumber,
        copyNumber,
        true
      );

      setHeader('Content-Type', 'application/pdf');
      setHeader(
        'Content-Disposition',
        `inline; filename="${getSupportDocumentFilename(sample, itemNumber, copyNumber)}"`
      );
      return { status: constants.HTTP_STATUS_OK, response: pdfBuffer };
    }
  },
  '/samples/:sampleId': {
    get: async ({ user, userRole }, { sampleId }) => {
      const sample = await getAndCheckSample(sampleId, user, userRole);
      console.info('Get sample', sample.id);

      const sampleItems = await sampleItemRepository.findMany(sample.id);

      return {
        status: constants.HTTP_STATUS_OK,
        response: {
          ...sample,
          items: sampleItems
        }
      };
    },
    put: async ({ body: sampleUpdate, user, userRole }, { sampleId }) => {
      const sample = await getAndCheckSample(sampleId, user, userRole);
      console.info('Update sample', sample.id, sampleUpdate);

      sampleUpdate.department = await getAndCheckSampleDepartement(
        sampleUpdate,
        user,
        userRole
      );

      if (!hasPermission(userRole, 'updateSample')) {
        throw new UserRoleMissingError();
      } else if (sample.region !== user.region) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      const mustBeSent =
        sample.status === 'Submitted' && sampleUpdate.status === 'Sent';

      if (
        mustBeSent &&
        !SampleBase.pick({
          sampledAt: true,
          sentAt: true
        })
          .check(sampleSendCheck)
          .safeParse({
            ...sampleUpdate,
            sentAt: new Date()
          }).success
      ) {
        return {
          status: constants.HTTP_STATUS_FORBIDDEN
        };
      }

      if (
        sample.context !== sampleUpdate.context &&
        DraftStatusList.includes(sampleUpdate.status)
      ) {
        //Les matrices sont différentes en fonction du contexte de prélèvement,
        // donc si le contexte change il faut réinitialiser la matrice qui est dans l'étape d'après.
        //Sinon l'utilisateur bloque tout le formulaire
        sampleUpdate.matrixKind = null;
        sampleUpdate.matrix = null;
      }

      const prescription =
        isProgrammingPlanSample(sampleUpdate) &&
        !isNil(sampleUpdate.context) &&
        !isNil(sampleUpdate.matrixKind) &&
        !isNil(sampleUpdate.stage)
          ? await prescriptionRepository
              .findMany({
                programmingPlanId: sampleUpdate.programmingPlanId,
                contexts: [sampleUpdate.context as ProgrammingPlanContext],
                matrixKind: sampleUpdate.matrixKind,
                stage: sampleUpdate.stage
              })
              .then((_) => _?.[0])
          : undefined;

      const prescriptionSubstances = prescription
        ? await prescriptionSubstanceRepository.findMany(prescription.id)
        : undefined;

      const prescriptionData: Pick<
        PartialSample,
        'prescriptionId' | 'monoSubstances' | 'multiSubstances'
      > =
        isProgrammingPlanSample(sampleUpdate) ||
        sample.context !== sampleUpdate.context
          ? {
              prescriptionId: prescription?.id || null,
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
        // const localPrescription = prescription
        //   ? await localPrescriptionRepository.findUnique({
        //     prescriptionId: prescription.id,
        //     region: sampleUpdate.region,
        //     includes: 'laboratories'
        //   })
        //   : undefined;
        await sampleItemRepository.updateMany(sample.id, sampleUpdate.items);
      }

      if (!isEqual(sample.documentIds, sampleUpdate.documentIds)) {
        await sampleRepository.updateDocumentIds(
          sample.id,
          sampleUpdate.documentIds ?? []
        );
      }

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

        const attachments: ({
          content: string;
          name: string;
        } | null)[] = await Promise.all(
          sampleItems.map(async (sampleItem) => {
            const sampleSupportDoc =
              await generateAndStoreSampleSupportDocument(
                updatedSample,
                sampleItems as SampleItem[],
                sampleItem.itemNumber,
                sampleItem.copyNumber
              );

            const sampleSupportAttachment = sampleSupportDoc
              ? {
                  name: `${getSupportDocumentFilename(
                    updatedSample,
                    sampleItem.itemNumber,
                    sampleItem.copyNumber
                  )}`,
                  content: sampleSupportDoc.toString('base64')
                }
              : null;

            if (sampleItem.copyNumber === 1) {
              const laboratory = (await laboratoryRepository.findUnique(
                sampleItem.laboratoryId as string
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
                if (laboratory.shortName in laboratoriesConf) {
                  const laboratoryShortName =
                    laboratory.shortName as LaboratoryWithConf;
                  laboratoryLabel =
                    Object.entries(
                      laboratoriesConf[laboratoryShortName].ssd2IdByLabel
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
                  reference: [updatedSample.reference, sampleItem?.copyNumber]
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
                  sampleSupportAttachment
                ].filter((_) => !isNil(_))
              });
            }
            return sampleSupportAttachment;
          })
        );

        if (sample.ownerEmail) {
          await mailService.send({
            templateName: 'SupportDocumentCopyToOwnerTemplate',
            recipients: [sample.ownerEmail],
            params: {
              region: user.region ? Regions[user.region].name : undefined,
              sampledAt: format(updatedSample.sampledAt, 'dd/MM/yyyy')
            },
            attachment: attachments.filter((_) => !isNil(_))
          });
        }
      }

      await sampleRepository.update(updatedPartialSample);

      return {
        status: constants.HTTP_STATUS_OK,
        response: updatedPartialSample
      };
    },
    delete: async ({ user, userRole }, { sampleId }) => {
      const sample = await getAndCheckSample(sampleId, user, userRole);
      console.info('Delete sample', sample.id);

      if (!DraftStatusList.includes(sample.status)) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      await sampleRepository.deleteOne(sample.id);

      return { status: constants.HTTP_STATUS_NO_CONTENT };
    }
  }
} as const satisfies ProtectedSubRouter;
