import { z } from 'zod';
import { DocumentKind } from './DocumentKind';
export const Document = z.object({
  id: z.guid(),
  filename: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.guid().nullish(),
  name: z.string().nullish(),
  kind: DocumentKind,
  legend: z.string().nullish(),
  notes: z.string().nullish()
});

export const DocumentToCreate = Document.pick({
  id: true,
  filename: true,
  name: true,
  kind: true,
  legend: true,
  notes: true
});

export const DocumentUpdate = Document.pick({
  name: true,
  legend: true,
  kind: true,
  notes: true
});

export type Document = z.infer<typeof Document>;
export type DocumentToCreate = z.infer<typeof DocumentToCreate>;
export type DocumentUpdate = z.infer<typeof DocumentUpdate>;
