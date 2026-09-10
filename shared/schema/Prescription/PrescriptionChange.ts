import { z } from 'zod';

export const PrescriptionChange = z.object({
  id: z.guid(),
  prescriptionId: z.guid(),
  sampleCount: z.coerce.number(),
  previousSampleCount: z.coerce.number().nullable(),
  changedAt: z.coerce.date(),
  diffusedAt: z.coerce.date().nullable(),
  changesViewedAt: z.coerce.date().nullable(),
  changesViewedBy: z.guid().nullable()
});
export type PrescriptionChange = z.infer<typeof PrescriptionChange>;
