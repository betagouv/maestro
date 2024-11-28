import _ from 'lodash';
import { z } from 'zod';
import { isDromRegion, Region, RegionSort } from '../../referential/Region';
import { Prescription } from '../Prescription/Prescription';
import { ProgrammingPlan } from '../ProgrammingPlan/ProgrammingPlans';
import { hasPermission, User, UserInfos, userRegions } from '../User/User';
import { RegionalPrescriptionComment } from './RegionalPrescriptionComment';

export const RegionalPrescriptionKey = z.object({
  prescriptionId: z.string().uuid(),
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

  const totalSampleCount = _.sumBy(
    regionalPrescriptionsWithLimitedSentCount.filter((_) =>
      region ? _.region === region : true
    ),
    'sampleCount'
  );

  const totalRealizedSampleCount = _.sumBy(
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
  user: User | UserInfos,
  programmingPlan: ProgrammingPlan,
  regionalPrescription: RegionalPrescription
): Record<RegionalPrescriptionPermission, boolean> => ({
  updateSampleCount:
    hasPermission(user, 'updatePrescription') &&
    userRegions(user).includes(regionalPrescription.region) &&
    (isDromRegion(regionalPrescription.region)
      ? programmingPlan.statusDrom !== 'Closed'
      : programmingPlan.status !== 'Closed'),
  comment:
    hasPermission(user, 'commentPrescription') &&
    userRegions(user).includes(regionalPrescription.region) &&
    (isDromRegion(regionalPrescription.region)
      ? programmingPlan.statusDrom === 'Submitted'
      : programmingPlan.status === 'Submitted'),
  updateLaboratory: hasPermission(user, 'updatePrescriptionLaboratory')
});
