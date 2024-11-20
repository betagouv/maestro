import _ from 'lodash';
import { z } from 'zod';
import { Region, RegionSort } from '../../referential/Region';
import { Prescription } from '../Prescription/Prescription';
import { RegionalPrescriptionComment } from './RegionalPrescriptionComment';

export const RegionalPrescription = z.object({
  id: z.string().uuid(),
  prescriptionId: z.string().uuid(),
  region: Region,
  sampleCount: z.coerce.number(),
  laboratoryId: z.string().nullish(),
  comments: z
    .array(
      RegionalPrescriptionComment.pick({
        id: true,
        comment: true,
        createdAt: true,
        createdBy: true,
      })
    )
    .nullish(),
  realizedSampleCount: z.coerce.number().nullish(),
});

export const RegionalPrescriptionUpdate = RegionalPrescription.pick({
  sampleCount: true,
  laboratoryId: true,
})
  .partial()
  .merge(Prescription.pick({ programmingPlanId: true }));

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
    ),
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
