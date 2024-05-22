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
  sampleMatrix: Matrix,
  sampleStage: Stage,
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
          regionalData: includedRegions.map((region) => {
            const regionalPrescription = prescriptions.find(
              (_) =>
                _.programmingPlanId === prescription.programmingPlanId &&
                _.sampleMatrix === prescription.sampleMatrix &&
                _.sampleStage === prescription.sampleStage &&
                _.region === region
            );
            const regionalSamples = samples.filter(
              (sample) =>
                sample.programmingPlanId === prescription.programmingPlanId &&
                sample.matrix === prescription.sampleMatrix &&
                sample.stage === prescription.sampleStage &&
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
        MatrixLabels[a.sampleMatrix],
        StageLabels[a.sampleStage],
      ]
        .join()
        .localeCompare(
          [
            b.programmingPlanId,
            MatrixLabels[b.sampleMatrix],
            StageLabels[b.sampleStage],
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
