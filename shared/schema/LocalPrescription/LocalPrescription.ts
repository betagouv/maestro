import { sumBy } from 'lodash-es';
import { z } from 'zod';
import { Region, RegionSort } from '../../referential/Region';
import { Prescription } from '../Prescription/Prescription';
import { ProgrammingPlan } from '../ProgrammingPlan/ProgrammingPlans';
import { hasPermission, User, userRegions } from '../User/User';
import { LocalPrescriptionComment } from './LocalPrescriptionComment';
import { LocalPrescriptionKey } from './LocalPrescriptionKey';

export const LocalPrescription = z.object({
  ...LocalPrescriptionKey.shape,
  sampleCount: z.coerce.number(),
  laboratoryId: z.string().nullish(),
  comments: z
    .array(
      LocalPrescriptionComment.pick({
        id: true,
        comment: true,
        createdAt: true,
        createdBy: true
      })
    )
    .nullish(),
  inProgressSampleCount: z.coerce.number().nullish(),
  realizedSampleCount: z.coerce.number().nullish()
});

export const LocalPrescriptionUpdate = z.object({
  ...LocalPrescription.pick({
    sampleCount: true,
    laboratoryId: true
  }).partial().shape,
  ...Prescription.pick({ programmingPlanId: true }).shape
});

export type LocalPrescription = z.infer<typeof LocalPrescription>;
export type LocalPrescriptionUpdate = z.infer<typeof LocalPrescriptionUpdate>;

export const getCompletionRate = (
  localPrescriptions: LocalPrescription | LocalPrescription[],
  region?: Region | null,
  limitedSentCount: boolean = false
) => {
  const localPrescriptionsWithLimitedSentCount: LocalPrescription[] = (
    Array.isArray(localPrescriptions)
      ? localPrescriptions
      : [localPrescriptions]
  ).map((localPrescription) => ({
    ...localPrescription,
    realizedSampleCount: limitedSentCount
      ? Math.min(
          localPrescription.sampleCount,
          localPrescription.realizedSampleCount ?? 0
        )
      : (localPrescription.realizedSampleCount ?? 0)
  }));

  const totalSampleCount = sumBy(
    localPrescriptionsWithLimitedSentCount.filter((_) =>
      region ? _.region === region : true
    ),
    'sampleCount'
  );

  const totalRealizedSampleCount = sumBy(
    localPrescriptionsWithLimitedSentCount.filter((_) =>
      region ? _.region === region : true
    ),
    'realizedSampleCount'
  );

  return Math.floor(
    totalSampleCount
      ? Number(((totalRealizedSampleCount / totalSampleCount) * 100).toFixed(2))
      : 100
  );
};

export const LocalPrescriptionSort = (
  a: LocalPrescription,
  b: LocalPrescription
) => RegionSort(a.region, b.region);

const LocalPrescriptionPermission = z.enum([
  'updateSampleCount',
  'comment',
  'distributeToDepartments',
  'updateLaboratory'
]);

export type LocalPrescriptionPermission = z.infer<
  typeof LocalPrescriptionPermission
>;

export const hasLocalPrescriptionPermission = (
  user: User,
  programmingPlan: ProgrammingPlan,
  localPrescription: { region: Region }
): Record<LocalPrescriptionPermission, boolean> => ({
  updateSampleCount:
    hasPermission(user, 'updatePrescription') &&
    userRegions(user).includes(localPrescription.region) &&
    programmingPlan.regionalStatus.find(
      (regionStatus) => regionStatus.region === localPrescription.region
    )?.status !== 'Closed',
  distributeToDepartments:
    hasPermission(user, 'distributePrescriptionToDepartments') &&
    userRegions(user).includes(localPrescription.region) &&
    programmingPlan.regionalStatus.find(
      (regionStatus) => regionStatus.region === localPrescription.region
    )?.status === 'SubmittedToRegion' &&
    programmingPlan.distributionKind === 'SLAUGHTERHOUSE',
  comment:
    hasPermission(user, 'commentPrescription') &&
    userRegions(user).includes(localPrescription.region) &&
    programmingPlan.regionalStatus.find(
      (regionStatus) => regionStatus.region === localPrescription.region
    )?.status === 'SubmittedToRegion',
  updateLaboratory:
    hasPermission(user, 'updatePrescriptionLaboratory') &&
    userRegions(user).includes(localPrescription.region) &&
    programmingPlan.regionalStatus.find(
      (regionStatus) => regionStatus.region === localPrescription.region
    )?.status === 'Validated'
});
