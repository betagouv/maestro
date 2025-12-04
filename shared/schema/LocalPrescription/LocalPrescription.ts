import { sumBy } from 'lodash-es';
import { z } from 'zod';
import { Department, DepartmentSort } from '../../referential/Department';
import { Region, RegionSort } from '../../referential/Region';
import { Prescription } from '../Prescription/Prescription';
import { ProgrammingPlan } from '../ProgrammingPlan/ProgrammingPlans';
import { hasPermission, User, userRegions } from '../User/User';
import { LocalPrescriptionComment } from './LocalPrescriptionComment';
import { LocalPrescriptionKey } from './LocalPrescriptionKey';
import {
  LocalPrescriptionSubstanceKindLaboratory,
  SubstanceKindLaboratory
} from './LocalPrescriptionSubstanceKindLaboratory';

export const LocalPrescription = z.object({
  ...LocalPrescriptionKey.shape,
  sampleCount: z.coerce.number(),
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
  substanceKindsLaboratories: z
    .array(
      LocalPrescriptionSubstanceKindLaboratory.pick({
        laboratoryId: true,
        substanceKind: true
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

export const LocalPrescriptionUpdate = z.discriminatedUnion('key', [
  z.object({
    key: z.literal('sampleCount'),
    ...LocalPrescription.pick({
      sampleCount: true
    }).shape,
    ...Prescription.pick({ programmingPlanId: true }).shape
  }),
  z.object({
    key: z.literal('laboratories'),
    substanceKindsLaboratories: z.array(SubstanceKindLaboratory),
    ...Prescription.pick({ programmingPlanId: true }).shape
  }),
  z.object({
    key: z.literal('slaughterhouseSampleCounts'),
    slaughterhouseSampleCounts: SlaughterhouseSampleCounts,
    ...Prescription.pick({ programmingPlanId: true }).shape
  })
]);

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
) =>
  RegionSort(a.region, b.region) === 0
    ? DepartmentSort(a?.department, b?.department)
    : RegionSort(a.region, b.region);

const LocalPrescriptionPermission = z.enum([
  'updateSampleCount',
  'comment',
  'distributeToDepartments',
  'distributeToSlaughterhouses',
  'updateLaboratories'
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
    programmingPlan.departmentalStatus.some(
      (departmentalStatus) =>
        departmentalStatus.region === localPrescription.region &&
        departmentalStatus.department === localPrescription.department &&
        ['Validated', 'SubmittedToDepartments'].includes(
          departmentalStatus.status
        )
    ),
  comment:
    hasPermission(user, 'commentPrescription') &&
    userRegions(user).includes(localPrescription.region) &&
    programmingPlan.distributionKind === 'REGIONAL' &&
    programmingPlan.regionalStatus.some(
      (regionStatus) =>
        regionStatus.region === localPrescription.region &&
        regionStatus.status === 'SubmittedToRegion'
    ),
  updateLaboratories:
    hasPermission(user, 'updatePrescriptionLaboratories') &&
    userRegions(user).includes(localPrescription.region) &&
    ((programmingPlan.distributionKind === 'REGIONAL' &&
      programmingPlan.regionalStatus.some(
        (regionStatus) =>
          regionStatus.region === localPrescription.region &&
          regionStatus.status === 'Validated'
      )) ||
      (programmingPlan.distributionKind === 'SLAUGHTERHOUSE' &&
        user.department === localPrescription.department &&
        programmingPlan.departmentalStatus.some(
          (departmentalStatus) =>
            departmentalStatus.region === localPrescription.region &&
            departmentalStatus.department === localPrescription.department &&
            ['Validated', 'SubmittedToDepartments'].includes(
              departmentalStatus.status
            )
        )))
});
