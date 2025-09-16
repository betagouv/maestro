import { isNil } from 'lodash-es';
import { z } from 'zod';
import { LocalPrescriptionKey } from './LocalPrescriptionKey';

export const LocalPrescriptionCommentToCreate = z.object({
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

export const LocalPrescriptionComment = z.object({
  ...LocalPrescriptionKey.shape,
  id: z.guid(),
  comment: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.string()
});

export type LocalPrescriptionCommentToCreate = z.infer<
  typeof LocalPrescriptionCommentToCreate
>;
export type LocalPrescriptionComment = z.infer<typeof LocalPrescriptionComment>;
