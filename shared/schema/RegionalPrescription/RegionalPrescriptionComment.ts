import { isNil } from 'lodash-es';
import { z } from 'zod';

export const RegionalPrescriptionCommentToCreate = z.object({
  programmingPlanId: z.guid(),
  comment: z
    .string({
      error: (issue) =>
        isNil(issue.input)
          ? 'Veuillez renseigner un commentaire.'
          : issue.message
    })
    .min(1, 'Veuillez renseigner un commentaire.')
});

export const RegionalPrescriptionComment = z.object({
  id: z.guid(),
  regionalPrescriptionId: z.guid(),
  comment: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.string()
});

export type RegionalPrescriptionCommentToCreate = z.infer<
  typeof RegionalPrescriptionCommentToCreate
>;
export type RegionalPrescriptionComment = z.infer<
  typeof RegionalPrescriptionComment
>;
