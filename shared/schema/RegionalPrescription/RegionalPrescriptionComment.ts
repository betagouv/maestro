import { z } from 'zod';

export const RegionalPrescriptionCommentToCreate = z.object({
  programmingPlanId: z.string().uuid(),
  comment: z
    .string({ required_error: 'Veuillez renseigner un commentaire.' })
    .min(1, 'Veuillez renseigner un commentaire.'),
});

export const RegionalPrescriptionComment = z.object({
  id: z.string().uuid(),
  regionalPrescriptionId: z.string().uuid(),
  comment: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.string(),
});

export type RegionalPrescriptionCommentToCreate = z.infer<
  typeof RegionalPrescriptionCommentToCreate
>;
export type RegionalPrescriptionComment = z.infer<
  typeof RegionalPrescriptionComment
>;
