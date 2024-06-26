import _ from 'lodash';
import { z } from 'zod';
import { Matrix } from '../../referential/Matrix/Matrix';
import { MatrixLabels } from '../../referential/Matrix/MatrixLabels';
import { Region, RegionList } from '../../referential/Region';
import { Stage, StageLabels } from '../../referential/Stage';
import { getSampleRegion, PartialSample } from '../Sample/Sample';
import { Prescription } from './Prescription';

export const PrescriptionByMatrix = z.object({
  programmingPlanId: z.string().uuid(),
  matrix: Matrix,
  stages: z.array(Stage),
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
            p.matrix === prescription.matrix &&
            _.isEqual(p.stages, prescription.stages)
        )
      ) {
        acc.push({
          programmingPlanId: prescription.programmingPlanId,
          matrix: prescription.matrix,
          stages: prescription.stages,
          regionalData: includedRegions.map((region) => {
            const regionalPrescription = prescriptions.find(
              (p) =>
                p.programmingPlanId === prescription.programmingPlanId &&
                p.matrix === prescription.matrix &&
                _.isEqual(p.stages, prescription.stages) &&
                p.region === region
            );
            const regionalSamples = samples.filter(
              (sample) =>
                sample.programmingPlanId === prescription.programmingPlanId &&
                sample.matrix === prescription.matrix &&
                sample.stage !== undefined &&
                prescription.stages.includes(sample.stage) &&
                getSampleRegion(sample) === region
            );

            return {
              sampleCount: regionalPrescription?.sampleCount ?? 0,
              sentSampleCount: regionalSamples?.length ?? 0,
              region,
              laboratoryId: regionalPrescription?.laboratoryId,
            };
          }),
        });
      }
      return acc;
    }, [] as PrescriptionByMatrix[])
    .sort((a, b) =>
      [
        a.programmingPlanId,
        MatrixLabels[a.matrix],
        ...a.stages.map((_) => StageLabels[_]),
      ]
        .join()
        .localeCompare(
          [
            b.programmingPlanId,
            MatrixLabels[b.matrix],
            ...b.stages.map((_) => StageLabels[_]),
          ].join()
        )
    );

export const matrixCompletionRate = (
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

export const completionRate = (
  prescriptions: Prescription[],
  samples: PartialSample[],
  region?: Region
): number => {
  const prescriptionsByMatrix = genPrescriptionByMatrix(
    prescriptions,
    samples,
    region ? [region] : undefined
  );
  return matrixCompletionRate(prescriptionsByMatrix, region);
};
