import { sumBy, uniq } from 'lodash-es';
import { RegionList, Regions } from 'maestro-shared/referential/Region';
import { type Stage, StageList } from 'maestro-shared/referential/Stage';
import {
  hasPrescriptionPermission,
  type Prescription
} from 'maestro-shared/schema/Prescription/Prescription';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import {
  editingEchelonForRole,
  pendingChangeVisibilityForRole
} from 'maestro-shared/schema/User/UserRole';
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';
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
import { programmingSubPlanRepository } from '../repositories/programmingSubPlanRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { excelService } from '../services/excelService/excelService';
import { parsePrescriptionImportFile } from '../services/prescriptionImportService';
import { withEffectiveLocalPrescriptionChanges } from './localPrescriptionController';

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

const prescriptionsBySubPlanNumberOf = async (
  programmingPlans: ProgrammingPlanChecked[]
): Promise<Map<string, Prescription[]>> => {
  const subPlanNumberById = new Map(
    programmingPlans.flatMap((programmingPlan) =>
      programmingPlan.subPlans.map(
        (subPlan) => [subPlan.id, subPlan.subPlanNumber] as const
      )
    )
  );

  const prescriptions = await prescriptionRepository.findMany({
    programmingPlanIds: programmingPlans.map(
      (programmingPlan) => programmingPlan.id
    )
  });

  const bySubPlanNumber = new Map<string, Prescription[]>();
  for (const prescription of prescriptions) {
    const subPlanNumber = subPlanNumberById.get(
      prescription.programmingSubPlanId
    );
    if (!subPlanNumber) {
      continue;
    }
    bySubPlanNumber.set(subPlanNumber, [
      ...(bySubPlanNumber.get(subPlanNumber) ?? []),
      prescription
    ]);
  }
  return bySubPlanNumber;
};

export const prescriptionsRouter = {
  '/prescriptions': {
    get: async ({ userRole, query: findOptions }) => {
      console.info('Find prescriptions', findOptions);

      const prescriptions = await prescriptionRepository.findMany(
        findOptions,
        pendingChangeVisibilityForRole(userRole)
      );

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
  '/prescriptions/import': {
    post: async ({ userRole, body }) => {
      console.info('Import prescriptions for year', body.year);

      const programmingPlans = await programmingPlanRepository.findMany({
        year: body.year
      });

      if (
        programmingPlans.length === 0 ||
        programmingPlans.every(
          (programmingPlan) =>
            !hasPrescriptionPermission(userRole, programmingPlan).update
        )
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }

      const { cells, unrecognized } = parsePrescriptionImportFile(
        Buffer.from(body.content, 'base64'),
        body.filename
      );

      const prescriptionsBySubPlanNumber =
        await prescriptionsBySubPlanNumberOf(programmingPlans);

      const now = new Date();
      const importedPrescriptionIds = new Set<string>();
      let importedCellCount = 0;

      for (const cell of cells) {
        const matching = prescriptionsBySubPlanNumber.get(cell.subPlanNumber);

        if (matching?.length !== 1) {
          unrecognized.push(`Ligne ${cell.rowNumber}`);
          continue;
        }

        const [prescription] = matching;
        const localPrescription = await localPrescriptionRepository.findUnique({
          prescriptionId: prescription.id,
          region: cell.region
        });

        if (!localPrescription) {
          unrecognized.push(`Ligne ${cell.rowNumber}`);
          continue;
        }

        await localPrescriptionChangeRepository.insert({
          prescriptionId: prescription.id,
          region: cell.region,
          echelon: 'National',
          kind: 'sampleCount',
          sampleCount: cell.sampleCount,
          previousSampleCount: localPrescription.sampleCount,
          changedAt: now
        });

        importedPrescriptionIds.add(prescription.id);
        importedCellCount += 1;
      }

      for (const prescriptionId of importedPrescriptionIds) {
        const { prescription } = await getAndCheckPrescription(
          prescriptionId,
          undefined
        );
        const localPrescriptions = await localPrescriptionRepository.findMany({
          prescriptionId
        });
        const importedByRegion = new Map(
          cells
            .filter(
              (cell) =>
                prescriptionsBySubPlanNumber.get(cell.subPlanNumber)?.at(0)
                  ?.id === prescriptionId
            )
            .map((cell) => [cell.region, cell.sampleCount])
        );

        await prescriptionChangeRepository.insert({
          prescriptionId,
          sampleCount: sumBy(
            localPrescriptions,
            (localPrescription) =>
              importedByRegion.get(localPrescription.region) ??
              localPrescription.sampleCount
          ),
          previousSampleCount: prescription.sampleCount,
          changedAt: now
        });
      }

      if (importedPrescriptionIds.size > 0) {
        await Promise.all(
          uniq(
            programmingPlans.map((programmingPlan) => programmingPlan.id)
          ).map((programmingPlanId) =>
            programmingPlanRepository.touchNationalLastModifiedAt(
              programmingPlanId
            )
          )
        );
      }

      return {
        status: HttpStatus.OK,
        response: { importedCellCount, unrecognized: uniq(unrecognized) }
      };
    }
  },
  '/prescriptions/counts': {
    get: async ({ userRole, query: findOptions }) => {
      console.info('Count prescriptions', findOptions);

      const rows = await prescriptionRepository.findCounts(
        findOptions,
        pendingChangeVisibilityForRole(userRole)
      );

      const subPlans = await programmingSubPlanRepository.findMany({
        ids: uniq(rows.map((row) => row.subPlanId))
      });
      const stagesBySubPlanId = new Map<ProgrammingSubPlanId, Stage[]>(
        subPlans.map((subPlan) => [subPlan.id, subPlan.stages])
      );

      const countByStage = new Map<Stage, number>();
      for (const row of rows) {
        for (const stage of stagesBySubPlanId.get(row.subPlanId) ?? []) {
          countByStage.set(stage, (countByStage.get(stage) ?? 0) + 1);
        }
      }

      const subPlanCountOf = (
        predicate: (row: (typeof rows)[number]) => boolean
      ) => uniq(rows.filter(predicate).map((row) => row.subPlanId)).length;

      const displayedRows = rows.filter(
        (row) =>
          (!findOptions.missingDistribution || row.missingDistribution) &&
          (!findOptions.missingLaboratory || row.missingLaboratory) &&
          (!findOptions.withNovelty || row.hasNovelty)
      );

      return {
        status: HttpStatus.OK,
        response: {
          subPlanCount: uniq(displayedRows.map((row) => row.subPlanId)).length,
          sampleCount: sumBy(displayedRows, 'sampleCount'),
          missingDistributionCount: subPlanCountOf(
            (row) => row.missingDistribution
          ),
          missingLaboratoryCount: subPlanCountOf(
            (row) => row.missingLaboratory
          ),
          noveltyCount: subPlanCountOf((row) => row.hasNovelty),
          distributedCount: subPlanCountOf((row) => !row.missingDistribution),
          stageCounts: StageList.filter((stage) => countByStage.has(stage)).map(
            (stage) => ({
              stage,
              count: countByStage.get(stage) as number
            })
          ),
          matrixKinds: uniq(rows.map((row) => row.matrixKind))
        }
      };
    }
  },
  '/prescriptions/export': {
    get: async (
      { user, userRole, query: queryFindOptions },
      _params,
      response
    ) => {
      const exportedPlanIds = uniq(
        [
          ...(queryFindOptions.programmingPlanIds ?? []),
          queryFindOptions.programmingPlanId
        ].filter(isDefinedAndNotNull)
      );

      const programmingPlans = await Promise.all(
        exportedPlanIds.map((planId) => getAndCheckProgrammingPlan(planId))
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
        await prescriptionRepository.findMany(
          findOptions,
          pendingChangeVisibilityForRole(userRole)
        ),
        userRole
      );
      const localPrescriptions = await withEffectiveLocalPrescriptionChanges(
        await localPrescriptionRepository.findMany({
          programmingPlanIds: exportedPlanIds,
          contexts: queryFindOptions.contexts,
          region: exportedRegion,
          department: exportedDepartment,
          includes: ['comments', 'sampleCounts', 'laboratories']
        }),
        userRole
      );

      const fileName = `prescriptions${
        findOptions.contexts
          ? findOptions.contexts.map((context) =>
              ContextLabels[context].toLowerCase().replaceAll(' ', '-')
            )
          : ''
      }.xlsx`;

      const buffer = await excelService.generatePrescriptionsExportExcel(
        programmingPlans,
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
