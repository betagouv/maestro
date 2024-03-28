import { z } from 'zod';
import { RegionList } from '../Region';
import { SampleStage, SampleStageList } from '../Sample/SampleStage';
import { Prescription } from './Prescription';

export const PrescriptionByMatrix = z.object({
  programmingPlanId: z.string().uuid(),
  sampleMatrix: z.string(),
  sampleStage: SampleStage,
  regionSampleCounts: z.array(z.number()),
});

export type PrescriptionByMatrix = z.infer<typeof PrescriptionByMatrix>;

export const genPrescriptionByMatrix = (
  prescriptions?: Prescription[],
  includedRegions = RegionList
): PrescriptionByMatrix[] =>
  (prescriptions ?? [])
    .reduce((acc, prescription) => {
      const index = acc.findIndex(
        (p) =>
          p.programmingPlanId === prescription.programmingPlanId &&
          p.sampleMatrix === prescription.sampleMatrix &&
          p.sampleStage === prescription.sampleStage
      );
      if (index === -1) {
        acc.push({
          programmingPlanId: prescription.programmingPlanId,
          sampleMatrix: prescription.sampleMatrix,
          sampleStage: prescription.sampleStage,
          regionSampleCounts: new Array(includedRegions.length).fill(0),
        });
      }
      acc[index === -1 ? acc.length - 1 : index].regionSampleCounts[
        includedRegions.indexOf(prescription.region)
      ] = prescription.sampleCount;
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
