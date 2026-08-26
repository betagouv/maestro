import { isNil } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import type { Region } from 'maestro-shared/referential/Region';
import type { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import type { LocalPrescriptionChange } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionChange';
import type { DistributionKind } from 'maestro-shared/schema/ProgrammingPlan/DistributionKind';
import type { ProgrammingPlanEchelon } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDisplayStatus';
import localPrescriptionChangeRepository from '../repositories/localPrescriptionChangeRepository';
import localPrescriptionRepository from '../repositories/localPrescriptionRepository';
import prescriptionChangeRepository from '../repositories/prescriptionChangeRepository';
import prescriptionRepository from '../repositories/prescriptionRepository';
import localPrescriptionDiffusionService from './localPrescriptionDiffusionService';

interface CommitResult {
  prescriptionIds: string[];
  regions: Region[];
}

interface RegionalCommitResult {
  prescriptionIds: string[];
  departments: Department[];
}

interface DepartmentalCommitResult {
  prescriptionIds: string[];
  companySirets: string[];
}

interface FlushScope {
  prescriptionIds: string[];
  region: Region;
  department?: Department;
}

const findLiveRow = (
  localPrescriptions: LocalPrescription[],
  change: Pick<
    LocalPrescriptionChange,
    'prescriptionId' | 'region' | 'department'
  >
) =>
  localPrescriptions.find(
    (_) =>
      _.prescriptionId === change.prescriptionId &&
      _.region === change.region &&
      (_.department ?? undefined) === (change.department ?? undefined) &&
      isNil(_.companySiret)
  );

const writeChangeToLive = async (
  change: LocalPrescriptionChange,
  localPrescriptions: LocalPrescription[]
): Promise<void> => {
  const localPrescription = findLiveRow(localPrescriptions, change);
  if (!localPrescription) {
    return;
  }
  if (change.kind === 'sampleCount' && !isNil(change.sampleCount)) {
    await localPrescriptionRepository.update({
      ...localPrescription,
      sampleCount: change.sampleCount
    });
  } else if (
    change.kind === 'laboratories' &&
    change.substanceKindsLaboratories
  ) {
    await localPrescriptionDiffusionService.commitLaboratories(
      localPrescription,
      change.substanceKindsLaboratories
    );
  }
};

const flushDiffusedChanges = async (
  scope: FlushScope,
  echelon: ProgrammingPlanEchelon,
  localPrescriptions: LocalPrescription[]
): Promise<void> => {
  const diffusedChanges =
    await localPrescriptionChangeRepository.findDiffusedUnapplied(
      scope,
      echelon
    );
  for (const change of diffusedChanges) {
    await writeChangeToLive(change, localPrescriptions);
  }
  await localPrescriptionChangeRepository.markApplied(
    scope,
    'sampleCount',
    echelon
  );
  await localPrescriptionChangeRepository.markApplied(
    scope,
    'laboratories',
    echelon
  );
};

const commitPendingNationalChanges = async (
  programmingPlanId: string
): Promise<CommitResult> => {
  const prescriptions = await prescriptionRepository.findMany({
    programmingPlanIds: [programmingPlanId]
  });
  const prescriptionIds = prescriptions.map((prescription) => prescription.id);

  const pendingPrescriptionChanges =
    await prescriptionChangeRepository.findLatestPending(prescriptionIds);
  for (const pending of pendingPrescriptionChanges) {
    const prescription = prescriptions.find(
      (_) => _.id === pending.prescriptionId
    );
    if (prescription) {
      await prescriptionRepository.update({
        ...prescription,
        sampleCount: pending.sampleCount
      });
    }
  }
  await prescriptionChangeRepository.commitPending(prescriptionIds);

  const localPrescriptions = await localPrescriptionRepository.findMany({
    programmingPlanIds: [programmingPlanId],
    allLevels: true
  });

  const pendingLocalChanges =
    await localPrescriptionChangeRepository.findLatestPending(
      prescriptionIds,
      'National'
    );
  const regions = new Set<Region>();
  for (const pending of pendingLocalChanges) {
    if (pending.kind !== 'sampleCount' || isNil(pending.sampleCount)) {
      continue;
    }
    if (findLiveRow(localPrescriptions, pending)) {
      regions.add(pending.region);
    }
  }
  await localPrescriptionChangeRepository.commitPending(
    { prescriptionIds },
    'sampleCount',
    'National'
  );

  return { prescriptionIds, regions: Array.from(regions) };
};

const commitPendingRegionalChanges = async (
  programmingPlanId: string,
  region: Region,
  distributionKind: DistributionKind
): Promise<RegionalCommitResult> => {
  const prescriptions = await prescriptionRepository.findMany({
    programmingPlanIds: [programmingPlanId]
  });
  const prescriptionIds = prescriptions.map((prescription) => prescription.id);

  const localPrescriptions = await localPrescriptionRepository.findMany({
    programmingPlanIds: [programmingPlanId],
    region,
    allLevels: true
  });

  await flushDiffusedChanges(
    { prescriptionIds, region },
    'National',
    localPrescriptions
  );

  const pendingChanges = (
    await localPrescriptionChangeRepository.findLatestPending(
      prescriptionIds,
      'Regional'
    )
  ).filter((pending) => pending.region === region);

  const departments = new Set<Department>();
  for (const pending of pendingChanges) {
    if (pending.department) {
      departments.add(pending.department);
    }
  }

  await localPrescriptionChangeRepository.commitPending(
    { prescriptionIds, region },
    'sampleCount',
    'Regional'
  );
  await localPrescriptionChangeRepository.commitPending(
    { prescriptionIds, region },
    'laboratories',
    'Regional'
  );

  if (distributionKind === 'REGIONAL') {
    await flushDiffusedChanges(
      { prescriptionIds, region },
      'Regional',
      localPrescriptions
    );
  }

  return { prescriptionIds, departments: Array.from(departments) };
};

const commitPendingDepartmentalChanges = async (
  programmingPlanId: string,
  region: Region,
  department: Department
): Promise<DepartmentalCommitResult> => {
  const prescriptions = await prescriptionRepository.findMany({
    programmingPlanIds: [programmingPlanId]
  });
  const prescriptionIds = prescriptions.map((prescription) => prescription.id);

  const localPrescriptions = await localPrescriptionRepository.findMany({
    programmingPlanIds: [programmingPlanId],
    region,
    department,
    allLevels: true
  });

  await flushDiffusedChanges(
    { prescriptionIds, region, department },
    'Regional',
    localPrescriptions
  );

  const pendingChanges = (
    await localPrescriptionChangeRepository.findLatestPending(
      prescriptionIds,
      'Departmental'
    )
  ).filter(
    (pending) => pending.region === region && pending.department === department
  );

  const companySirets = new Set<string>();

  for (const pending of pendingChanges) {
    if (
      pending.kind !== 'laboratories' ||
      !pending.substanceKindsLaboratories
    ) {
      continue;
    }
    const localPrescription = findLiveRow(localPrescriptions, pending);
    if (localPrescription) {
      await localPrescriptionDiffusionService.commitLaboratories(
        localPrescription,
        pending.substanceKindsLaboratories
      );
    }
  }

  const sampleCountPendingByPrescription = new Map<
    string,
    typeof pendingChanges
  >();
  for (const pending of pendingChanges) {
    if (
      pending.kind !== 'sampleCount' ||
      isNil(pending.sampleCount) ||
      !pending.companySiret
    ) {
      continue;
    }
    const rows = sampleCountPendingByPrescription.get(pending.prescriptionId);
    if (rows) {
      rows.push(pending);
    } else {
      sampleCountPendingByPrescription.set(pending.prescriptionId, [pending]);
    }
    companySirets.add(pending.companySiret);
  }
  for (const [
    prescriptionId,
    rows
  ] of sampleCountPendingByPrescription.entries()) {
    await localPrescriptionRepository.updateMany(
      { prescriptionId, region, department },
      rows.map((row) => ({
        prescriptionId,
        region,
        department,
        companySiret: row.companySiret as string,
        sampleCount: row.sampleCount as number
      }))
    );
  }

  await localPrescriptionChangeRepository.commitPending(
    { prescriptionIds, region, department },
    'sampleCount',
    'Departmental'
  );
  await localPrescriptionChangeRepository.commitPending(
    { prescriptionIds, region, department },
    'laboratories',
    'Departmental'
  );
  await localPrescriptionChangeRepository.markApplied(
    { prescriptionIds, region, department },
    'sampleCount',
    'Departmental'
  );
  await localPrescriptionChangeRepository.markApplied(
    { prescriptionIds, region, department },
    'laboratories',
    'Departmental'
  );

  return { prescriptionIds, companySirets: Array.from(companySirets) };
};

export default {
  commitPendingNationalChanges,
  commitPendingRegionalChanges,
  commitPendingDepartmentalChanges
};
