import { sumBy } from 'lodash-es';
import { z } from 'zod';
import { Department } from '../../referential/Department';
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

export const SlaughterhouseSampleCounts = z
  .array(
    LocalPrescription.pick({
      companySiret: true,
      sampleCount: true
    })
  )
  .min(1, { message: 'Au moins un abattoir doit être renseigné.' });

export const LocalPrescriptionUpdate = z.object({
  ...Prescription.pick({ programmingPlanId: true }).shape,
  update: z.union([
    LocalPrescription.pick({
      sampleCount: true
    }),
    LocalPrescription.pick({
      laboratoryId: true
    }),
    SlaughterhouseSampleCounts
  ])
});

export type SlaughterhouseSampleCounts = z.infer<
  typeof SlaughterhouseSampleCounts
>;
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
  'distributeToSlaughterhouses',
  'updateLaboratory'
]);

export type LocalPrescriptionPermission = z.infer<
  typeof LocalPrescriptionPermission
>;

export const hasLocalPrescriptionPermission = (
  user: User,
  programmingPlan: ProgrammingPlan,
  localPrescription: { region: Region; department?: Department | null }
): Record<LocalPrescriptionPermission, boolean> => ({
  updateSampleCount:
    hasPermission(user, 'updatePrescription') &&
    userRegions(user).includes(localPrescription.region) &&
    programmingPlan.regionalStatus.find(
      (regionStatus) => regionStatus.region === localPrescription.region
    )?.status !== 'Closed',
  distributeToDepartments:
    programmingPlan.distributionKind === 'SLAUGHTERHOUSE' &&
    hasPermission(user, 'distributePrescriptionToDepartments') &&
    userRegions(user).includes(localPrescription.region) &&
    programmingPlan.regionalStatus.find(
      (regionStatus) => regionStatus.region === localPrescription.region
    )?.status !== 'Closed',
  distributeToSlaughterhouses:
    programmingPlan.distributionKind === 'SLAUGHTERHOUSE' &&
    hasPermission(user, 'distributePrescriptionToSlaughterhouses') &&
    userRegions(user).includes(localPrescription.region) &&
    user.department === localPrescription.department &&
    programmingPlan.regionalStatus.find(
      (regionStatus) => regionStatus.region === localPrescription.region
    )?.status === 'SubmittedToDepartments',
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
