import { z } from 'zod';
import { LocalPrescriptionComment } from '../LocalPrescription/LocalPrescriptionComment';
import { ProgrammingPlanChecked } from '../ProgrammingPlan/ProgrammingPlans';
import { getPrescriptionTitle, Prescription } from './Prescription';

export const PrescriptionComments = z.object({
  programmingPlan: ProgrammingPlanChecked,
  prescription: Prescription,
  comments: z
    .array(
      LocalPrescriptionComment.pick({
        comment: true,
        createdAt: true,
        createdBy: true
      })
    )
    .min(1)
});

export type PrescriptionComments = z.infer<typeof PrescriptionComments>;

export const PrescriptionCommentSort = (
  pc1: PrescriptionComments,
  pc2: PrescriptionComments
) =>
  getPrescriptionTitle(pc1.prescription).localeCompare(
    getPrescriptionTitle(pc2.prescription)
  );
