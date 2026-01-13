import { z } from 'zod';
import { CheckFn } from 'zod/v4/core';
import {
  DocumentKind,
  DocumentKindLabels,
  ResourceDocumentKindList
} from './DocumentKind';

export const documentChecks: CheckFn<Pick<Document, 'kind' | 'name'>> = ({
  value,
  issues
}) => {
  if (
    ResourceDocumentKindList.includes(value.kind) &&
    (!value.name || value.name.trim() === '')
  ) {
    issues.push({
      input: value,
      code: 'custom',
      message: `Le nom du document est obligatoire pour le type de document "${DocumentKindLabels[value.kind]}"`,
      path: ['name']
    });
  }
};

const DocumentBase = z.object({
  id: z.guid(),
  filename: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.guid().nullish(),
  name: z.string().nullish(),
  kind: DocumentKind,
  legend: z.string().nullish(),
  notes: z.string().nullish()
});

export const Document = DocumentBase.check(documentChecks);

export const DocumentToCreate = DocumentBase.pick({
  id: true,
  filename: true,
  name: true,
  kind: true,
  legend: true,
  notes: true
}).check(documentChecks);

export const DocumentUpdate = DocumentBase.pick({
  name: true,
  legend: true,
  kind: true,
  notes: true
}).check(documentChecks);

export type Document = z.infer<typeof Document>;
export type DocumentToCreate = z.infer<typeof DocumentToCreate>;
export type DocumentUpdate = z.infer<typeof DocumentUpdate>;
