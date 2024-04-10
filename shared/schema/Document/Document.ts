import { z } from 'zod';
export const Document = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid(),
});

export const DocumentToCreate = Document.pick({
  id: true,
  filename: true,
});

export type Document = z.infer<typeof Document>;
export type DocumentToCreate = z.infer<typeof DocumentToCreate>;
