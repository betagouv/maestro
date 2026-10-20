import { z } from 'zod';
import { LocalPrescriptionComment } from '../LocalPrescription/LocalPrescriptionComment';
import type { MatrixReferential } from '../Matrix/MatrixReferential';
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

const prescriptionCommentsTitle = (
  referential: MatrixReferential,
  { programmingPlan, prescription }: PrescriptionComments
): string => getPrescriptionTitle(referential, [programmingPlan], prescription);

export const PrescriptionCommentSort =
  (referential: MatrixReferential) =>
  (pc1: PrescriptionComments, pc2: PrescriptionComments) =>
    prescriptionCommentsTitle(referential, pc1).localeCompare(
      prescriptionCommentsTitle(referential, pc2)
    );
