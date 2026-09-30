import { z } from 'zod';
import { LocalPrescriptionComment } from '../LocalPrescription/LocalPrescriptionComment';
import { ProgrammingPlanChecked } from '../ProgrammingPlan/ProgrammingPlans';
import {
  findPrescriptionSubPlan,
  getSubPlanMatrixTitle
} from '../ProgrammingPlan/ProgrammingSubPlan';
import { Prescription } from './Prescription';

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

const prescriptionCommentsTitle = ({
  programmingPlan,
  prescription
}: PrescriptionComments): string => {
  const subPlan = findPrescriptionSubPlan([programmingPlan], prescription);
  return (subPlan && getSubPlanMatrixTitle(subPlan)) ?? '';
};

export const PrescriptionCommentSort = (
  pc1: PrescriptionComments,
  pc2: PrescriptionComments
) =>
  prescriptionCommentsTitle(pc1).localeCompare(prescriptionCommentsTitle(pc2));
