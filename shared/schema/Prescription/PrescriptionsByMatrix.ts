import { z } from 'zod';
import { RegionList } from '../Region';
import { SampleStage } from '../Sample/SampleStage';
import { Prescription } from './Prescription';

export const PrescriptionByMatrix = z.object({
  programmingPlanId: z.string().uuid(),
  sampleMatrix: z.string(),
  sampleStage: SampleStage,
  regionSampleCounts: z.array(z.number()),
});

export type PrescriptionByMatrix = z.infer<typeof PrescriptionByMatrix>;

export const genPrescriptionByMatrix = (
  prescriptions?: Prescription[]
): PrescriptionByMatrix[] =>
  (prescriptions ?? []).reduce((acc, prescription) => {
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
        regionSampleCounts: new Array(18).fill(0),
      });
    }
    acc[index === -1 ? acc.length - 1 : index].regionSampleCounts[
      RegionList.indexOf(prescription.region)
    ] = prescription.sampleCount;
    return acc;
  }, [] as PrescriptionByMatrix[]);
