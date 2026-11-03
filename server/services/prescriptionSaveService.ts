import { isNil, uniq, uniqBy } from 'lodash-es';
import LocalPrescriptionMissingError from 'maestro-shared/errors/localPrescriptionPlanMissingError';
import PrescriptionMissingError from 'maestro-shared/errors/prescriptionPlanMissingError';
import ProgrammingPlanMissingError from 'maestro-shared/errors/programmingPlanMissingError';
import type { Department } from 'maestro-shared/referential/Department';
import type { Region } from 'maestro-shared/referential/Region';
import { hasLocalPrescriptionPermission } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { previousSampleCountFor } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionChange';
import {
  type LocalPrescriptionKey,
  toLocalPrescriptionKeyString
} from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionKey';
import type { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import {
  hasPrescriptionPermission,
  type Prescription
} from 'maestro-shared/schema/Prescription/Prescription';
import type {
  PrescriptionSampleCountUpdate,
  PrescriptionSaveResult,
  ScopedLocalPrescriptionUpdate
} from 'maestro-shared/schema/Prescription/PrescriptionSave';
import { hasEverSentOnward } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDisplayStatus';
import type { ProgrammingPlanEchelon } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanEchelon';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { UserBase } from 'maestro-shared/schema/User/User';
import {
  changeViewAudienceForRole,
  editingEchelonForRole,
  type UserRole
} from 'maestro-shared/schema/User/UserRole';
import { HttpStatus } from '../constants/httpStatus';
import { knexInstance as db } from '../repositories/db';
import localPrescriptionChangeRepository, {
  type LocalPrescriptionChangeInsert
} from '../repositories/localPrescriptionChangeRepository';
import localPrescriptionRepository from '../repositories/localPrescriptionRepository';
import prescriptionChangeRepository, {
  type PrescriptionChangeInsert
} from '../repositories/prescriptionChangeRepository';
import prescriptionRepository from '../repositories/prescriptionRepository';
import programmingPlanRepository from '../repositories/programmingPlanRepository';

type ChangeScopeKey = Omit<LocalPrescriptionKey, 'companySiret'>;

type TouchScope = {
  programmingPlanId: string;
  region?: Region | null;
  department?: Department | null;
};

type PrescriptionSaveStatus =
  | { status: typeof HttpStatus.OK; response: PrescriptionSaveResult }
  | { status: typeof HttpStatus.FORBIDDEN | typeof HttpStatus.BAD_REQUEST };

const hasSampleWithSeveralLaboratories = (
  programmingPlan: ProgrammingPlanChecked,
  prescription: Pick<Prescription, 'programmingSubPlanId'>,
  substanceKindsLaboratories: SubstanceKindLaboratory[]
): boolean =>
  (
    programmingPlan.subPlans.find(
      (subPlan) => subPlan.id === prescription.programmingSubPlanId
    )?.samples ?? []
  ).some(
    (sample) =>
      uniq(
        substanceKindsLaboratories
          .filter(({ substanceKind }) =>
            sample.substanceKinds.includes(substanceKind)
          )
          .map(({ laboratoryId }) => laboratoryId ?? null)
      ).length > 1
  );

export const savePrescriptions = async ({
  user,
  userRole,
  prescriptionUpdates,
  localPrescriptionUpdates
}: {
  user: UserBase;
  userRole: UserRole;
  prescriptionUpdates: PrescriptionSampleCountUpdate[];
  localPrescriptionUpdates: ScopedLocalPrescriptionUpdate[];
}): Promise<PrescriptionSaveStatus> => {
  if (
    prescriptionUpdates.length === 0 &&
    localPrescriptionUpdates.length === 0
  ) {
    return {
      status: HttpStatus.OK,
      response: { prescriptionCount: 0, localPrescriptionCount: 0 }
    };
  }

  const prescriptionIds = uniq([
    ...prescriptionUpdates.map((_) => _.prescriptionId),
    ...localPrescriptionUpdates.map((_) => _.prescriptionId)
  ]);

  const prescriptions = await prescriptionRepository.findMany({
    ids: prescriptionIds
  });
  const prescriptionById = new Map(
    prescriptions.map((prescription) => [prescription.id, prescription])
  );

  const missingPrescriptionId = prescriptionIds.find(
    (id) => !prescriptionById.has(id)
  );
  if (missingPrescriptionId) {
    throw new PrescriptionMissingError(missingPrescriptionId);
  }

  const subPlanIds = uniq(
    prescriptions.map((prescription) => prescription.programmingSubPlanId)
  );
  const programmingPlans = await programmingPlanRepository.findMany({
    subPlanIds
  });
  const programmingPlanBySubPlanId = new Map(
    programmingPlans.flatMap((programmingPlan) =>
      programmingPlan.subPlans.map(
        (subPlan) => [subPlan.id, programmingPlan] as const
      )
    )
  );

  const programmingPlanOf = (prescription: Prescription) => {
    const programmingPlan = programmingPlanBySubPlanId.get(
      prescription.programmingSubPlanId
    );
    if (!programmingPlan) {
      throw new ProgrammingPlanMissingError(prescription.programmingSubPlanId);
    }
    return programmingPlan;
  };

  const scopeKeys: LocalPrescriptionKey[] = localPrescriptionUpdates.map(
    ({ prescriptionId, region, department }) => ({
      prescriptionId,
      region,
      department
    })
  );
  const companyKeys: LocalPrescriptionKey[] = localPrescriptionUpdates.flatMap(
    ({ prescriptionId, region, department, update }) =>
      update.key === 'slaughterhouseSampleCounts'
        ? update.slaughterhouseSampleCounts.map(({ companySiret }) => ({
            prescriptionId,
            region,
            department,
            companySiret
          }))
        : []
  );

  const [scopeRows, companyRows, lastDiffusedChanges] = await Promise.all([
    localPrescriptionRepository.findManyByKeys(scopeKeys),
    localPrescriptionRepository.findManyByKeys(companyKeys),
    localPrescriptionChangeRepository.findLastDiffused({ prescriptionIds })
  ]);

  const localPrescriptionByKey = new Map(
    [...scopeRows, ...companyRows].map((localPrescription) => [
      toLocalPrescriptionKeyString(localPrescription),
      localPrescription
    ])
  );

  const localChanges: LocalPrescriptionChangeInsert[] = [];
  const prescriptionChanges: PrescriptionChangeInsert[] = [];
  const sampleCountViewedKeys: ChangeScopeKey[] = [];
  const laboratoriesViewedKeys: ChangeScopeKey[] = [];
  const touchScopes: TouchScope[] = [];
  const changedAt = new Date();

  for (const { prescriptionId, sampleCount } of prescriptionUpdates) {
    const prescription = prescriptionById.get(prescriptionId) as Prescription;
    const programmingPlan = programmingPlanOf(prescription);

    if (!hasPrescriptionPermission(userRole, programmingPlan).update) {
      return { status: HttpStatus.FORBIDDEN };
    }

    prescriptionChanges.push({
      prescriptionId,
      sampleCount,
      previousSampleCount: prescription.sampleCount,
      changedAt
    });
    touchScopes.push({ programmingPlanId: programmingPlan.id });
  }

  for (const {
    prescriptionId,
    region,
    department,
    update
  } of localPrescriptionUpdates) {
    const prescription = prescriptionById.get(prescriptionId) as Prescription;
    const programmingPlan = programmingPlanOf(prescription);

    const localPrescription = localPrescriptionByKey.get(
      toLocalPrescriptionKeyString({ prescriptionId, region, department })
    );
    if (!localPrescription) {
      throw new LocalPrescriptionMissingError(prescriptionId, region);
    }

    const permissions = hasLocalPrescriptionPermission(
      user,
      userRole,
      programmingPlan,
      localPrescription
    );

    touchScopes.push({
      programmingPlanId: programmingPlan.id,
      region,
      department
    });

    if (update.key === 'laboratories') {
      if (!permissions.updateLaboratories) {
        return { status: HttpStatus.FORBIDDEN };
      }
      if (
        hasSampleWithSeveralLaboratories(
          programmingPlan,
          prescription,
          update.substanceKindsLaboratories
        )
      ) {
        return { status: HttpStatus.BAD_REQUEST };
      }

      localChanges.push({
        prescriptionId,
        region,
        department: department ?? undefined,
        echelon: editingEchelonForRole(userRole) as ProgrammingPlanEchelon,
        kind: 'laboratories',
        substanceKindsLaboratories: update.substanceKindsLaboratories,
        previousSampleCount: null,
        changedAt
      });
      laboratoriesViewedKeys.push({ prescriptionId, region, department });
      if (isNil(department)) {
        sampleCountViewedKeys.push({ prescriptionId, region });
      }
      continue;
    }

    if (update.key === 'slaughterhouseSampleCounts') {
      if (isNil(department) || !permissions.distributeToSlaughterhouses) {
        return { status: HttpStatus.FORBIDDEN };
      }

      localChanges.push(
        ...update.slaughterhouseSampleCounts.map((slaughterhouse) => ({
          prescriptionId,
          region,
          department,
          companySiret: slaughterhouse.companySiret as string,
          echelon: 'Departmental' as const,
          kind: 'sampleCount' as const,
          sampleCount: slaughterhouse.sampleCount,
          previousSampleCount: previousSampleCountFor(
            {
              prescriptionId,
              region,
              department,
              companySiret: slaughterhouse.companySiret
            },
            lastDiffusedChanges,
            localPrescriptionByKey.get(
              toLocalPrescriptionKeyString({
                prescriptionId,
                region,
                department,
                companySiret: slaughterhouse.companySiret
              })
            )?.sampleCount ?? 0
          ),
          changedAt
        }))
      );
      sampleCountViewedKeys.push({ prescriptionId, region, department });
      continue;
    }

    if (isNil(department)) {
      if (!permissions.updateSampleCount) {
        return { status: HttpStatus.FORBIDDEN };
      }

      localChanges.push({
        prescriptionId,
        region,
        echelon: 'National',
        kind: 'sampleCount',
        sampleCount: update.sampleCount,
        previousSampleCount: previousSampleCountFor(
          localPrescription,
          lastDiffusedChanges,
          hasEverSentOnward(
            'National',
            programmingPlan.distributionKind,
            programmingPlan.nationalStatus
          )
            ? localPrescription.sampleCount
            : null
        ),
        changedAt
      });
      continue;
    }

    if (!permissions.distributeToDepartments) {
      return { status: HttpStatus.FORBIDDEN };
    }

    localChanges.push({
      prescriptionId,
      region,
      department,
      echelon: 'Regional',
      kind: 'sampleCount',
      sampleCount: update.sampleCount,
      previousSampleCount: previousSampleCountFor(
        localPrescription,
        lastDiffusedChanges,
        hasEverSentOnward(
          'Regional',
          programmingPlan.distributionKind,
          programmingPlan.regionalStatus.find((_) => _.region === region)
        )
          ? localPrescription.sampleCount
          : null
      ),
      changedAt
    });
    sampleCountViewedKeys.push({ prescriptionId, region, department });
    sampleCountViewedKeys.push({ prescriptionId, region });
  }

  const audience = changeViewAudienceForRole(userRole);
  const uniqueKeys = (keys: ChangeScopeKey[]) =>
    uniqBy(keys, (key) => toLocalPrescriptionKeyString(key));

  await db.transaction(async (transaction) => {
    await localPrescriptionChangeRepository.insertMany(
      localChanges,
      transaction
    );
    await prescriptionChangeRepository.insertMany(
      prescriptionChanges,
      transaction
    );
    await localPrescriptionChangeRepository.markManyViewedByKeys(
      {
        keys: uniqueKeys(sampleCountViewedKeys),
        kind: 'sampleCount',
        viewedBy: user.id,
        audience
      },
      transaction
    );
    await localPrescriptionChangeRepository.markManyViewedByKeys(
      {
        keys: uniqueKeys(laboratoriesViewedKeys),
        kind: 'laboratories',
        viewedBy: user.id,
        audience
      },
      transaction
    );
    await programmingPlanRepository.touchLocalStatuses(
      touchScopes,
      transaction
    );
  });

  return {
    status: HttpStatus.OK,
    response: {
      prescriptionCount: prescriptionUpdates.length,
      localPrescriptionCount: localPrescriptionUpdates.length
    }
  };
};
