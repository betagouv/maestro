import { z } from 'zod';
import type { CheckFn } from 'zod/v4/core';
import { checkSchema } from '../../utils/zod';
import {
  DocumentKind,
  DocumentKindLabels,
  ResourceDocumentKindList
} from './DocumentKind';

export const documentChecks: CheckFn<
  Pick<z.infer<typeof DocumentBase>, 'kind' | 'name' | 'year'>
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
  if (ResourceDocumentKindList.includes(value.kind) && !value.year) {
    issues.push({
      input: value,
      code: 'custom',
      message: `L'année est obligatoire pour le type de document "${DocumentKindLabels[value.kind]}"`,
      path: ['year']
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
  notes: z.string().nullish(),
  year: z.number().int().nullish(),
  programmingPlanIds: z.array(z.guid()).nullish()
});

export const DocumentChecked = checkSchema(DocumentBase, documentChecks);

export const DocumentToCreateChecked = checkSchema(
  DocumentBase.pick({
    id: true,
    filename: true,
    name: true,
    kind: true,
    legend: true,
    notes: true,
    year: true,
    programmingPlanIds: true
  }),
  documentChecks
);

export const DocumentUpdateChecked = checkSchema(
  DocumentBase.pick({
    name: true,
    legend: true,
    kind: true,
    notes: true,
    year: true,
    programmingPlanIds: true
  }),
  documentChecks
);

export type DocumentChecked = z.infer<typeof DocumentChecked>;
export type DocumentToCreateChecked = z.infer<typeof DocumentToCreateChecked>;
export type DocumentUpdateChecked = z.infer<typeof DocumentUpdateChecked>;
