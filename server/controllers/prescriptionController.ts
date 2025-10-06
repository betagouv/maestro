import { constants } from 'http2';
import { RegionList, Regions } from 'maestro-shared/referential/Region';
import { hasPrescriptionPermission } from 'maestro-shared/schema/Prescription/Prescription';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { v4 as uuidv4 } from 'uuid';
import { getAndCheckPrescription } from '../middlewares/checks/prescriptionCheck';
import { getAndCheckProgrammingPlan } from '../middlewares/checks/programmingPlanCheck';
import localPrescriptionRepository from '../repositories/localPrescriptionRepository';
import prescriptionRepository from '../repositories/prescriptionRepository';
import prescriptionSubstanceRepository from '../repositories/prescriptionSubstanceRepository';
import { ProtectedSubRouter } from '../routers/routes.type';
import { excelService } from '../services/excelService/excelService';

export const prescriptionsRouter = {
  '/prescriptions': {
    get: async ({ query: findOptions }) => {
      console.info('Find prescriptions', findOptions);

      const prescriptions = await prescriptionRepository.findMany(findOptions);

      return { status: constants.HTTP_STATUS_OK, response: prescriptions };
    },
    post: async ({ user, body }) => {
      const programmingPlan = await getAndCheckProgrammingPlan(
        body.programmingPlanId
      );

      if (!hasPrescriptionPermission(user, programmingPlan).create) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      console.info(
        'Create prescriptions for programming plan with id',
        programmingPlan.id
      );

      const createdPrescription = {
        ...body,
        id: uuidv4(),
        programmingPlanId: programmingPlan.id
      };

      await prescriptionRepository.insert(createdPrescription);

      await localPrescriptionRepository.insertMany(
        RegionList.map((region) => ({
          prescriptionId: createdPrescription.id,
          region,
          sampleCount: 0
        }))
      );

      if (programmingPlan.distributionKind === 'SLAUGHTERHOUSE') {
        await localPrescriptionRepository.insertMany(
          RegionList.flatMap((region) =>
            Regions[region].departments.map((department) => ({
              prescriptionId: createdPrescription.id,
              region,
              department,
              sampleCount: 0
            }))
          )
        );
      }

      return {
        status: constants.HTTP_STATUS_CREATED,
        response: createdPrescription
      };
    }
  },
  '/prescriptions/export': {
    get: async ({ user, query: queryFindOptions }, _params, response) => {
      const exportedRegion = user.region ?? undefined;

      const findOptions = {
        ...queryFindOptions,
        region: exportedRegion
      };

      console.info('Export prescriptions', user.id, findOptions);

      const prescriptions =
        await prescriptionRepository.findMany(queryFindOptions);
      const regionalPrescriptions = await localPrescriptionRepository.findMany({
        ...findOptions,
        includes: ['comments', 'sampleCounts']
      });

      const fileName = `prescriptions-${findOptions.contexts?.map((context) =>
        ContextLabels[context].toLowerCase().replaceAll(' ', '-')
      )}.xlsx`;

      const buffer = await excelService.generatePrescriptionsExportExcel(
        prescriptions,
        regionalPrescriptions,
        exportedRegion
      );

      response.setHeader(
        'Content-disposition',
        `inline; filename=${encodeURIComponent(fileName)}`
      );
      response.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      response.setHeader('Content-Length', `${buffer.length}`);

      return { status: constants.HTTP_STATUS_OK, response: buffer };
    }
  },
  '/prescriptions/:prescriptionId': {
    put: async ({ user, body: prescriptionUpdate }, { prescriptionId }) => {
      const programmingPlan = await getAndCheckProgrammingPlan(
        prescriptionUpdate.programmingPlanId
      );

      if (!hasPrescriptionPermission(user, programmingPlan).update) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      const { prescription } = await getAndCheckPrescription(
        prescriptionId,
        programmingPlan
      );

      console.info('Update prescription with id', prescription.id);

      const updatedPrescription = {
        ...prescription,
        stages: prescriptionUpdate.stages ?? prescription.stages,
        notes: prescriptionUpdate.notes ?? prescription.notes
      };

      await prescriptionRepository.update(updatedPrescription);

      if (prescriptionUpdate.substances) {
        const substances = prescriptionUpdate.substances.map((substance) => ({
          prescriptionId: prescription.id,
          ...substance
        }));

        await prescriptionSubstanceRepository.deleteMany(prescription.id);
        await prescriptionSubstanceRepository.insertMany(substances);
      }

      return {
        status: constants.HTTP_STATUS_OK,
        response: updatedPrescription
      };
    },
    delete: async ({ user }, { prescriptionId }) => {
      console.info('Delete prescription with id', prescriptionId);

      const { prescription, programmingPlan } = await getAndCheckPrescription(
        prescriptionId,
        undefined
      );

      if (!hasPrescriptionPermission(user, programmingPlan).delete) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      await prescriptionRepository.deleteOne(prescription.id);

      return { status: constants.HTTP_STATUS_NO_CONTENT };
    }
  },
  '/prescriptions/:prescriptionId/substances': {
    get: async (_, { prescriptionId }) => {
      console.info('Get prescription substances', prescriptionId);

      const { prescription } = await getAndCheckPrescription(
        prescriptionId,
        undefined
      );

      const substances = await prescriptionSubstanceRepository.findMany(
        prescription.id
      );

      return { status: constants.HTTP_STATUS_OK, response: substances };
    }
  }
} as const satisfies ProtectedSubRouter;
