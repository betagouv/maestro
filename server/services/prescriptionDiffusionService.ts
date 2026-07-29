import { isNil } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import type { Region } from 'maestro-shared/referential/Region';
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
  const regionLocalPrescriptions = localPrescriptions.filter((_) =>
    isNil(_.department)
  );

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
    const localPrescription = regionLocalPrescriptions.find(
      (_) =>
        _.prescriptionId === pending.prescriptionId &&
        _.region === pending.region
    );
    if (localPrescription) {
      await localPrescriptionRepository.update({
        ...localPrescription,
        sampleCount: pending.sampleCount
      });
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

/**
 * Applies the Regional echelon's pending edits, for one region, to the
 * live local_prescriptions tables: the region-level sampleCount/labs, and
 * the region's split by department (sampleCount + labs). Called right
 * before the plan advances that region past SubmittedToRegion, so
 * Departmental (and Samplers, for REGIONAL-kind plans) see these values
 * instead of a half-diffused mix. Company/abattoir-level bulk splits are a
 * Departmental-authored concern, not committed here.
 */
const commitPendingRegionalChanges = async (
  programmingPlanId: string,
  region: Region
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

  const pendingChanges = (
    await localPrescriptionChangeRepository.findLatestPending(
      prescriptionIds,
      'Regional'
    )
  ).filter((pending) => pending.region === region);

  const departments = new Set<Department>();
  for (const pending of pendingChanges) {
    const localPrescription = localPrescriptions.find(
      (_) =>
        _.prescriptionId === pending.prescriptionId &&
        _.region === pending.region &&
        (_.department ?? undefined) === (pending.department ?? undefined) &&
        isNil(_.companySiret)
    );
    if (!localPrescription) {
      continue;
    }
    if (pending.kind === 'sampleCount' && !isNil(pending.sampleCount)) {
      await localPrescriptionRepository.update({
        ...localPrescription,
        sampleCount: pending.sampleCount
      });
    } else if (
      pending.kind === 'laboratories' &&
      pending.substanceKindsLaboratories
    ) {
      await localPrescriptionDiffusionService.commitLaboratories(
        localPrescription,
        pending.substanceKindsLaboratories
      );
    }
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

  return { prescriptionIds, departments: Array.from(departments) };
};

/**
 * Applies the Departmental echelon's pending edits, for one department, to
 * the live local_prescriptions tables: department-level labs and the
 * abattoir-level sampleCount bulk split. Called right before
 * "Lancer la campagne" / a re-diffusion, so Samplers see these values
 * instead of a half-diffused mix.
 */
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

  const pendingChanges = (
    await localPrescriptionChangeRepository.findLatestPending(
      prescriptionIds,
      'Departmental'
    )
  ).filter(
    (pending) => pending.region === region && pending.department === department
  );

  const companySirets = new Set<string>();

  // Department-level labs: a live row always pre-exists (seeded at
  // prescription creation), so a direct commit is enough.
  for (const pending of pendingChanges) {
    if (
      pending.kind !== 'laboratories' ||
      !pending.substanceKindsLaboratories
    ) {
      continue;
    }
    const localPrescription = localPrescriptions.find(
      (_) =>
        _.prescriptionId === pending.prescriptionId &&
        _.region === pending.region &&
        (_.department ?? undefined) === (pending.department ?? undefined) &&
        isNil(_.companySiret)
    );
    if (localPrescription) {
      await localPrescriptionDiffusionService.commitLaboratories(
        localPrescription,
        pending.substanceKindsLaboratories
      );
    }
  }

  // Abattoir-level sampleCount bulk split: unlike region/department rows,
  // a company's local_prescriptions row is never pre-seeded (companies are
  // dynamic), so a plain .update() would silently no-op on a new abattoir.
  // Mirror the live route's own semantics instead: one delete-then-reinsert
  // per prescription, replacing the full company set at once.
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

  return { prescriptionIds, companySirets: Array.from(companySirets) };
};

export default {
  commitPendingNationalChanges,
  commitPendingRegionalChanges,
  commitPendingDepartmentalChanges
};
