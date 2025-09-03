import { isNil } from 'lodash-es';
import { z } from 'zod';
import { Region } from '../../referential/Region';

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
  prescriptionId: z.guid(),
  region: Region,
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
