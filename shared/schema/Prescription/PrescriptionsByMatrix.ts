import _ from 'lodash';
import { z } from 'zod';
import { Region, RegionList, Regions } from '../Region';
import { PartialSample } from '../Sample/Sample';
import { SampleStage, SampleStageList } from '../Sample/SampleStage';
import { Prescription } from './Prescription';

export const PrescriptionByMatrix = z.object({
  programmingPlanId: z.string().uuid(),
  sampleMatrix: z.string(),
  sampleStage: SampleStage,
  regionalData: z.array(
    Prescription.pick({
      sampleCount: true,
      laboratoryId: true,
      region: true,
    }).merge(z.object({ sentSampleCount: z.number() }))
  ),
});

export type PrescriptionByMatrix = z.infer<typeof PrescriptionByMatrix>;

export const genPrescriptionByMatrix = (
  prescriptions: Prescription[],
  samples: PartialSample[],
  includedRegions = RegionList
): PrescriptionByMatrix[] =>
  (prescriptions ?? [])
    .reduce((acc, prescription) => {
      if (
        !acc.some(
          (p) =>
            p.programmingPlanId === prescription.programmingPlanId &&
            p.sampleMatrix === prescription.sampleMatrix &&
            p.sampleStage === prescription.sampleStage
        )
      ) {
        acc.push({
          programmingPlanId: prescription.programmingPlanId,
          sampleMatrix: prescription.sampleMatrix,
          sampleStage: prescription.sampleStage,
          regionalData: includedRegions.map((region) => ({
            sampleCount:
              prescriptions.find(
                (_) =>
                  _.programmingPlanId === prescription.programmingPlanId &&
                  _.sampleMatrix === prescription.sampleMatrix &&
                  _.sampleStage === prescription.sampleStage &&
                  _.region === region
              )?.sampleCount ?? 0,
            sentSampleCount:
              samples.filter(
                (sample) =>
                  sample.programmingPlanId === prescription.programmingPlanId &&
                  sample.matrix === prescription.sampleMatrix &&
                  sample.stage === prescription.sampleStage &&
                  RegionList.find((region) =>
                    Regions[region].departments.includes(sample.department)
                  ) === region
              )?.length ?? 0,
            region,
          })),
        });
      }
      return acc;
    }, [] as PrescriptionByMatrix[])
    .sort((a, b) =>
      [
        a.programmingPlanId,
        a.sampleMatrix,
        SampleStageList.indexOf(a.sampleStage),
      ]
        .join()
        .localeCompare(
          [
            b.programmingPlanId,
            b.sampleMatrix,
            SampleStageList.indexOf(b.sampleStage),
          ].join()
        )
    );

export const completionRate = (
  prescriptionMatrix: PrescriptionByMatrix | PrescriptionByMatrix[],
  region?: Region
) => {
  const prescriptionsWithLimitedSentCount: PrescriptionByMatrix[] = (
    Array.isArray(prescriptionMatrix)
      ? prescriptionMatrix
      : [prescriptionMatrix]
  ).map((prescription) => ({
    ...prescription,
    regionalData: prescription.regionalData.map((data) => ({
      ...data,
      sentSampleCount: Math.min(data.sampleCount, data.sentSampleCount),
    })),
  }));

  const totalSampleCount = _.sumBy(
    prescriptionsWithLimitedSentCount,
    (prescription) =>
      region
        ? prescription.regionalData.find((_) => _.region === region)
            ?.sampleCount ?? 0
        : _.sumBy(prescription.regionalData, 'sampleCount')
  );

  const totalSentSampleCount = _.sumBy(
    prescriptionsWithLimitedSentCount,
    (prescription) =>
      region
        ? prescription.regionalData.find((_) => _.region === region)
            ?.sentSampleCount ?? 0
        : _.sumBy(prescription.regionalData, 'sentSampleCount')
  );

  return totalSampleCount
    ? Number(((totalSentSampleCount / totalSampleCount) * 100).toFixed(2))
    : 100;
};
