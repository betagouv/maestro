import { z } from 'zod';

export const PrescriptionCommentToCreate = z.object({
  programmingPlanId: z.string().uuid(),
  comment: z
    .string({ required_error: 'Veuillez renseigner un commentaire.' })
    .min(1, 'Veuillez renseigner un commentaire.'),
});

export const PrescriptionComment = z.object({
  id: z.string().uuid(),
  prescriptionId: z.string().uuid(),
  comment: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.string(),
});

export type PrescriptionCommentToCreate = z.infer<
  typeof PrescriptionCommentToCreate
>;
export type PrescriptionComment = z.infer<typeof PrescriptionComment>;
