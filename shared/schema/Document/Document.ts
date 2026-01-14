import { z } from 'zod';
import { CheckFn } from 'zod/v4/core';
import {
  DocumentKind,
  DocumentKindLabels,
  ResourceDocumentKindList
} from './DocumentKind';

export const documentChecks: CheckFn<
  Pick<DocumentChecked, 'kind' | 'name'>
> = ({ value, issues }) => {
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

export const DocumentChecked = DocumentBase.check(documentChecks);

export const DocumentToCreateChecked = DocumentBase.pick({
  id: true,
  filename: true,
  name: true,
  kind: true,
  legend: true,
  notes: true
}).check(documentChecks);

export const DocumentUpdateChecked = DocumentBase.pick({
  name: true,
  legend: true,
  kind: true,
  notes: true
}).check(documentChecks);

export type DocumentChecked = z.infer<typeof DocumentChecked>;
export type DocumentToCreateChecked = z.infer<typeof DocumentToCreateChecked>;
export type DocumentUpdateChecked = z.infer<typeof DocumentUpdateChecked>;
