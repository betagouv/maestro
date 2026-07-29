import { RegionList, Regions } from 'maestro-shared/referential/Region';
import {
  hasPrescriptionPermission,
  type Prescription
} from 'maestro-shared/schema/Prescription/Prescription';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { editingEchelonForRole } from 'maestro-shared/schema/User/UserRole';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus } from '../constants/httpStatus';
import { getAndCheckPrescription } from '../middlewares/checks/prescriptionCheck';
import { getAndCheckProgrammingPlan } from '../middlewares/checks/programmingPlanCheck';
import localPrescriptionChangeRepository from '../repositories/localPrescriptionChangeRepository';
import localPrescriptionRepository from '../repositories/localPrescriptionRepository';
import prescriptionChangeRepository from '../repositories/prescriptionChangeRepository';
import prescriptionRepository from '../repositories/prescriptionRepository';
import prescriptionSubstanceRepository from '../repositories/prescriptionSubstanceRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { excelService } from '../services/excelService/excelService';

const withPendingPrescriptionChanges = async (
  prescriptions: Prescription[],
  userRole: Parameters<typeof editingEchelonForRole>[0]
): Promise<Prescription[]> => {
  if (editingEchelonForRole(userRole) !== 'National') {
    return prescriptions;
  }
  const pendingRows = await prescriptionChangeRepository.findLatestPending(
    prescriptions.map((prescription) => prescription.id)
  );
  const pendingByPrescriptionId = new Map(
    pendingRows.map((row) => [row.prescriptionId, row])
  );
  return prescriptions.map((prescription) => {
    const pending = pendingByPrescriptionId.get(prescription.id);
    return pending
      ? { ...prescription, sampleCount: pending.sampleCount }
      : prescription;
  });
};

export const prescriptionsRouter = {
  '/prescriptions': {
    get: async ({ userRole, query: findOptions }) => {
      console.info('Find prescriptions', findOptions);

      const prescriptions = await prescriptionRepository.findMany(findOptions);

      return {
        status: HttpStatus.OK,
        response: await withPendingPrescriptionChanges(prescriptions, userRole)
      };
    },
    post: async ({ userRole, body }) => {
      const programmingPlan = await getAndCheckProgrammingPlan(
        body.programmingPlanId
      );

      if (!hasPrescriptionPermission(userRole, programmingPlan).create) {
        return { status: HttpStatus.FORBIDDEN };
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

      await localPrescriptionChangeRepository.insertMany(
        RegionList.map((region) => {
          const now = new Date();
          return {
            prescriptionId: createdPrescription.id,
            region,
            echelon: 'National' as const,
            kind: 'sampleCount' as const,
            previousSampleCount: null,
            changedAt: now,
            diffusedAt: now
          };
        })
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

      await programmingPlanRepository.touchLocalStatus(programmingPlan.id);

      return {
        status: HttpStatus.CREATED,
        response: createdPrescription
      };
    }
  },
  '/prescriptions/export': {
    get: async (
      { user, userRole, query: queryFindOptions },
      _params,
      response
    ) => {
      const programmingPlan = await getAndCheckProgrammingPlan(
        queryFindOptions.programmingPlanId
      );
      const exportedRegion = user.region ?? undefined;
      const exportedDepartment = user.department ?? undefined;

      const findOptions = {
        ...queryFindOptions,
        region: exportedRegion,
        department: exportedDepartment
      };

      console.info('Export prescriptions', user.id, findOptions);

      const prescriptions = await withPendingPrescriptionChanges(
        await prescriptionRepository.findMany(queryFindOptions),
        userRole
      );
      const localPrescriptions = await localPrescriptionRepository.findMany({
        programmingPlanIds: queryFindOptions.programmingPlanId
          ? [queryFindOptions.programmingPlanId]
          : undefined,
        contexts: queryFindOptions.contexts,
        region: exportedRegion,
        department: exportedDepartment,
        includes: ['comments', 'sampleCounts', 'laboratories']
      });

      const fileName = `prescriptions${
        findOptions.contexts
          ? findOptions.contexts.map((context) =>
              ContextLabels[context].toLowerCase().replaceAll(' ', '-')
            )
          : ''
      }.xlsx`;

      const buffer = await excelService.generatePrescriptionsExportExcel(
        programmingPlan,
        prescriptions,
        localPrescriptions,
        exportedRegion,
        exportedDepartment
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

      return { status: HttpStatus.OK, response: buffer };
    }
  },
  '/prescriptions/:prescriptionId': {
    put: async ({ userRole, body: prescriptionUpdate }, { prescriptionId }) => {
      const programmingPlan = await getAndCheckProgrammingPlan(
        prescriptionUpdate.programmingPlanId
      );

      if (!hasPrescriptionPermission(userRole, programmingPlan).update) {
        return { status: HttpStatus.FORBIDDEN };
      }

      const { prescription } = await getAndCheckPrescription(
        prescriptionId,
        programmingPlan
      );

      console.info('Update prescription with id', prescription.id);

      const updatedPrescription = {
        ...prescription,
        stages: prescriptionUpdate.stages ?? prescription.stages,
        notes: prescriptionUpdate.notes ?? prescription.notes,
        programmingInstruction:
          prescriptionUpdate.programmingInstruction ??
          prescription.programmingInstruction
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

      let pendingSampleCount = prescription.sampleCount;
      if (prescriptionUpdate.sampleCount !== undefined) {
        await prescriptionChangeRepository.insert({
          prescriptionId: prescription.id,
          sampleCount: prescriptionUpdate.sampleCount,
          previousSampleCount: prescription.sampleCount,
          changedAt: new Date()
        });
        pendingSampleCount = prescriptionUpdate.sampleCount;
      }

      await programmingPlanRepository.touchNationalLastModifiedAt(
        programmingPlan.id
      );

      return {
        status: HttpStatus.OK,
        response: { ...updatedPrescription, sampleCount: pendingSampleCount }
      };
    },
    delete: async ({ userRole }, { prescriptionId }) => {
      console.info('Delete prescription with id', prescriptionId);

      const { prescription, programmingPlan } = await getAndCheckPrescription(
        prescriptionId,
        undefined
      );

      if (!hasPrescriptionPermission(userRole, programmingPlan).delete) {
        return { status: HttpStatus.FORBIDDEN };
      }

      await prescriptionRepository.deleteOne(prescription.id);
      await programmingPlanRepository.touchLocalStatus(programmingPlan.id);

      return { status: HttpStatus.NO_CONTENT };
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

      return { status: HttpStatus.OK, response: substances };
    }
  }
} as const satisfies ProtectedSubRouter;
