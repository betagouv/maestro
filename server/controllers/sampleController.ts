import { constants } from 'node:http2';
import { format } from 'date-fns';
import { isEqual, isNil, omit } from 'lodash-es';
import NoRegionError from 'maestro-shared/errors/noRegionError';
import SampleItemMissingError from 'maestro-shared/errors/sampleItemMissingError';
import UserRoleMissingError from 'maestro-shared/errors/userRoleMissingError';
import { type Region, Regions } from 'maestro-shared/referential/Region';
import type { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { getSupportDocumentFilename } from 'maestro-shared/schema/Document/DocumentKind';
import type { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { buildFindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  hasSamplePermission,
  isProgrammingPlanSample,
  type PartialSample,
  SampleBase,
  SampleChecked,
  sampleSendCheck
} from 'maestro-shared/schema/Sample/Sample';
import {
  SampleItem,
  SampleItemMaxCopyCount,
  SampleItemSort
} from 'maestro-shared/schema/Sample/SampleItem';
import { buildSpecificDataSchema } from 'maestro-shared/schema/SpecificData/buildSpecificDataSchema';
import { hasPermission } from 'maestro-shared/schema/User/User';
import { checkSchema } from 'maestro-shared/utils/zod';
import { PDFDocument } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import { getAndCheckProgrammingPlan } from '../middlewares/checks/programmingPlanCheck';
import {
  getAndCheckSample,
  getAndCheckSampleDepartement
} from '../middlewares/checks/sampleCheck';
import { analysisReportDocumentsRepository } from '../repositories/analysisReportDocumentsRepository';
import { analysisRepository } from '../repositories/analysisRepository';
import companyRepository from '../repositories/companyRepository';
import prescriptionRepository from '../repositories/prescriptionRepository';
import prescriptionSubstanceRepository from '../repositories/prescriptionSubstanceRepository';
import sampleItemRepository from '../repositories/sampleItemRepository';
import { sampleRepository } from '../repositories/sampleRepository';
import { specificDataFieldConfigRepository } from '../repositories/specificDataFieldConfigRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { excelService } from '../services/excelService/excelService';
import { pdfService } from '../services/pdfService/pdfService';
import { supportDocumentProcessor } from '../services/supportDocumentProcessor';

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
      const findOptions = buildFindSampleOptions(user, userRole, query);

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

      const programmingPlan = await getAndCheckProgrammingPlan(
        sampleToCreate.programmingPlanId
      );

      const reference = await getNewReference(
        user.region,
        programmingPlan.year
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
    get: async ({ user, userRole, query }) => {
      const findOptions = buildFindSampleOptions(user, userRole, query);

      console.info('Count samples for user', user.id, findOptions);

      const count = await sampleRepository.count(findOptions);

      return { status: constants.HTTP_STATUS_OK, response: { count } };
    }
  },
  '/samples/export': {
    get: async ({ user, userRole, query }, _params, { setHeader }) => {
      const findOptions = buildFindSampleOptions(user, userRole, query);

      console.info('Export samples for user', user.id, findOptions);

      const samples = await sampleRepository.findMany(findOptions);

      const fileName = `prelevements-${format(
        new Date(),
        'yyyy-MM-dd-HH-mm-ss'
      )}.xls`;

      const buffer = await excelService.generateSamplesExportExcel(
        samples,
        hasPermission(userRole, 'exportSamplesWithCodes')
      );

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
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
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
  '/samples/:sampleId/items/:itemNumber/copy/:copyNumber': {
    put: async (
      { body: itemUpdate, user, userRole },
      { sampleId, itemNumber, copyNumber }
    ) => {
      const sample = await getAndCheckSample(sampleId, user, userRole);
      const sampleItem = await sampleItemRepository.findUnique(
        sampleId,
        itemNumber,
        copyNumber
      );

      if (!sampleItem) {
        throw new SampleItemMissingError(sampleId, itemNumber, copyNumber);
      }

      if (
        (itemUpdate.updateKey === 'analysis' ||
          itemUpdate.updateKey === 'billing') &&
        !hasSamplePermission(user, userRole, sample)['performAnalysis']
      ) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      if (
        itemUpdate.updateKey === 'shipping' &&
        !hasPermission(userRole, 'updateSample')
      ) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      console.info('Update sampleItem', sample.id, itemNumber, copyNumber);

      await sampleItemRepository.update(sample.id, itemNumber, copyNumber, {
        ...itemUpdate,
        sampleId,
        itemNumber,
        copyNumber
      });

      const analysis = await analysisRepository.findUnique({
        sampleId,
        itemNumber,
        copyNumber
      });

      const computeStatus = () => {
        if (itemUpdate.updateKey === 'analysis') {
          //Pas de changement de recevabilité
          if (
            isNil(itemUpdate.isAdmissible) &&
            itemUpdate.receiptDate === sampleItem.receiptDate
          ) {
            return analysis?.status ?? 'Sent';
          }
          //Passage à non recevable
          if (itemUpdate.isAdmissible === false) {
            return 'NotAdmissible';
          }
          //Pas encore d'analyse
          if (!analysis) {
            return 'Sent';
          }
          //Passage de non recevable à recevable
          if (analysis.status === 'NotAdmissible' && itemUpdate.isAdmissible) {
            const analysisReportDoc =
              analysisReportDocumentsRepository.findByAnalysisId(analysis.id);
            return !isNil(analysis?.compliance)
              ? 'Completed'
              : !isNil(analysisReportDoc)
                ? 'InReview'
                : 'Analysis';
          }
        }
        return analysis?.status ?? 'Sent';
      };
      const status = computeStatus();

      if (!analysis) {
        const analysis: PartialAnalysis = {
          id: uuidv4(),
          sampleId,
          itemNumber,
          copyNumber,
          createdAt: new Date(),
          createdBy: user.id,
          status,
          compliance: null,
          notesOnCompliance: null
        };
        await analysisRepository.insert(analysis);
      } else {
        await analysisRepository.update({
          ...analysis,
          ...omit(
            itemUpdate.updateKey === 'analysis'
              ? {
                  ...itemUpdate?.analysis,
                  status,
                  compliance:
                    itemUpdate?.isAdmissible === false
                      ? null
                      : analysis.compliance,
                  notesOnCompliance:
                    itemUpdate?.isAdmissible === false
                      ? null
                      : analysis.notesOnCompliance
                }
              : {},
            'updateKey'
          )
        });
      }

      await sampleRepository.evaluateSampleCompliance(sampleId);

      return { status: constants.HTTP_STATUS_OK };
    }
  },
  '/samples/:sampleId/compliance': {
    put: async ({ body: complianceData, user, userRole }, { sampleId }) => {
      const sample = await getAndCheckSample(sampleId, user, userRole);

      console.info('Update sample compliance', sample.id, complianceData);

      if (sample.programmingPlanKind === 'PPV') {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      const updatedSample = {
        ...sample,
        ...complianceData
      } as SampleChecked;

      await sampleRepository.update(updatedSample);

      return { status: constants.HTTP_STATUS_OK, response: complianceData };
    }
  },
  '/samples/:sampleId/emptyForm': {
    get: async ({ user, userRole }, { sampleId }, { setHeader }) => {
      const sample = await getAndCheckSample(sampleId, user, userRole);

      console.info('Get sample empty form', sample.id);

      const pdfBuffer = await pdfService.generateSampleEmptyFormPDF(sample);

      setHeader('Content-Type', 'application/pdf');
      setHeader(
        'Content-Disposition',
        `inline; filename="Formulaire-${sample.reference}.pdf"`
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

      if (['Sent', 'Submitted'].includes(sampleUpdate.step)) {
        const fieldConfigs =
          await specificDataFieldConfigRepository.findByPlanKind(
            sampleUpdate.programmingPlanId,
            sampleUpdate.programmingPlanKind
          );
        const specificDataSchema = buildSpecificDataSchema(fieldConfigs);
        const result = specificDataSchema.safeParse(sampleUpdate.specificData);
        if (!result.success) {
          return { status: constants.HTTP_STATUS_BAD_REQUEST };
        }
      }

      const mustBeSent =
        sample.step === 'Submitted' && sampleUpdate.step === 'Sent';

      if (
        mustBeSent &&
        !checkSchema(
          SampleBase.pick({
            sampledDate: true,
            sentAt: true,
            specificData: true
          }),
          sampleSendCheck
        ).safeParse({
          ...sampleUpdate,
          sentAt: new Date()
        }).success
      ) {
        return {
          status: constants.HTTP_STATUS_FORBIDDEN
        };
      }

      if (sample.context !== sampleUpdate.context) {
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
        ...(mustBeSent
          ? {
              sentAt: new Date()
            }
          : {})
      };

      await sampleRepository.update(updatedPartialSample);

      if (mustBeSent) {
        const sampleItems = await sampleItemRepository.findMany(sample.id);
        const checkedSample = SampleChecked.parse(updatedPartialSample);
        const allSampleItems = sampleItems.map((item) =>
          SampleItem.parse(item)
        );

        const items: { analysisId: string; sampleItem: SampleItem }[] = [];

        for (const sampleItem of sampleItems) {
          if (sampleItem.copyNumber === 1) {
            const analysis: PartialAnalysis = {
              id: uuidv4(),
              sampleId,
              itemNumber: sampleItem.itemNumber,
              copyNumber: sampleItem.copyNumber,
              createdAt: new Date(),
              createdBy: user.id,
              status: 'Sent',
              compliance: null,
              notesOnCompliance: null
            };
            await analysisRepository.insert(analysis);
            items.push({
              analysisId: analysis.id,
              sampleItem: SampleItem.parse(sampleItem)
            });
          }
        }

        supportDocumentProcessor.triggerProcessing(
          checkedSample,
          allSampleItems,
          items
        );
      }

      return {
        status: constants.HTTP_STATUS_OK,
        response: updatedPartialSample
      };
    },
    delete: async ({ user, userRole }, { sampleId }) => {
      const sample = await getAndCheckSample(sampleId, user, userRole);
      console.info('Delete sample', sample.id);

      if (sample.status !== 'Draft') {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      await sampleRepository.deleteOne(sample.id);

      return { status: constants.HTTP_STATUS_NO_CONTENT };
    }
  }
} as const satisfies ProtectedSubRouter;
