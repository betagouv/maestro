import { z } from 'zod';
import { DocumentKind } from './DocumentKind';
export const Document = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid().nullish(),
  kind: DocumentKind,
  legend: z.string().nullish()
});

export const DocumentToCreate = Document.pick({
  id: true,
  filename: true,
  kind: true,
  legend: true
});

export const DocumentUpdate = Document.pick({
  legend: true
});

export type Document = z.infer<typeof Document>;
export type DocumentToCreate = z.infer<typeof DocumentToCreate>;
export type DocumentUpdate = z.infer<typeof DocumentUpdate>;
