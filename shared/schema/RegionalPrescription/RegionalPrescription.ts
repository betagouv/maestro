import { sumBy } from 'lodash-es';
import { z } from 'zod/v4';
import { Region, RegionSort } from '../../referential/Region';
import { Prescription } from '../Prescription/Prescription';
import { ProgrammingPlan } from '../ProgrammingPlan/ProgrammingPlans';
import { hasPermission, User, userRegions } from '../User/User';
import { RegionalPrescriptionComment } from './RegionalPrescriptionComment';

export const RegionalPrescriptionKey = z.object({
  prescriptionId: z.guid(),
  region: Region
});

export const RegionalPrescription = z.object({
  ...RegionalPrescriptionKey.shape,
  sampleCount: z.coerce.number(),
  laboratoryId: z.string().nullish(),
  comments: z
    .array(
      RegionalPrescriptionComment.pick({
        id: true,
        comment: true,
        createdAt: true,
        createdBy: true
      })
    )
    .nullish(),
  realizedSampleCount: z.coerce.number().nullish()
});

export const RegionalPrescriptionUpdate = RegionalPrescription.pick({
  sampleCount: true,
  laboratoryId: true
})
  .partial()
  .merge(Prescription.pick({ programmingPlanId: true }));

export type RegionalPrescriptionKey = z.infer<typeof RegionalPrescriptionKey>;
export type RegionalPrescription = z.infer<typeof RegionalPrescription>;
export type RegionalPrescriptionUpdate = z.infer<
  typeof RegionalPrescriptionUpdate
>;

export const getCompletionRate = (
  regionalPrescriptions: RegionalPrescription | RegionalPrescription[],
  region?: Region
) => {
  const regionalPrescriptionsWithLimitedSentCount: RegionalPrescription[] = (
    Array.isArray(regionalPrescriptions)
      ? regionalPrescriptions
      : [regionalPrescriptions]
  ).map((regionalPrescription) => ({
    ...regionalPrescription,
    realizedSampleCount: Math.min(
      regionalPrescription.sampleCount,
      regionalPrescription.realizedSampleCount ?? 0
    )
  }));

  const totalSampleCount = sumBy(
    regionalPrescriptionsWithLimitedSentCount.filter((_) =>
      region ? _.region === region : true
    ),
    'sampleCount'
  );

  const totalRealizedSampleCount = sumBy(
    regionalPrescriptionsWithLimitedSentCount.filter((_) =>
      region ? _.region === region : true
    ),
    'realizedSampleCount'
  );

  return totalSampleCount
    ? Number(((totalRealizedSampleCount / totalSampleCount) * 100).toFixed(2))
    : 100;
};

export const RegionalPrescriptionSort = (
  a: RegionalPrescription,
  b: RegionalPrescription
) => RegionSort(a.region, b.region);

const RegionalPrescriptionPermission = z.enum([
  'updateSampleCount',
  'comment',
  'updateLaboratory'
]);

export type RegionalPrescriptionPermission = z.infer<
  typeof RegionalPrescriptionPermission
>;

export const hasRegionalPrescriptionPermission = (
  user: User,
  programmingPlan: ProgrammingPlan,
  regionalPrescription: { region: Region }
): Record<RegionalPrescriptionPermission, boolean> => ({
  updateSampleCount:
    hasPermission(user, 'updatePrescription') &&
    userRegions(user).includes(regionalPrescription.region) &&
    programmingPlan.regionalStatus.find(
      (regionStatus) => regionStatus.region === regionalPrescription.region
    )?.status !== 'Closed',
  comment:
    hasPermission(user, 'commentPrescription') &&
    userRegions(user).includes(regionalPrescription.region) &&
    programmingPlan.regionalStatus.find(
      (regionStatus) => regionStatus.region === regionalPrescription.region
    )?.status === 'Submitted',
  updateLaboratory:
    hasPermission(user, 'updatePrescriptionLaboratory') &&
    userRegions(user).includes(regionalPrescription.region) &&
    programmingPlan.regionalStatus.find(
      (regionStatus) => regionStatus.region === regionalPrescription.region
    )?.status === 'Validated'
});
