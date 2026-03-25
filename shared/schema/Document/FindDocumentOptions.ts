import { z } from 'zod';
import { coerceToArray } from '../../utils/utils';
import { DocumentKind } from './DocumentKind';

export const FindDocumentOptions = z.object({
  kinds: coerceToArray(z.array(DocumentKind)).nullish(),
  sampleId: z.guid().nullish(),
  programmingPlanIds: coerceToArray(z.array(z.guid())).nullish(),
  includeNoProgrammingPlan: z.coerce.boolean().nullish(),
  year: z.coerce.number().int().nullish()
});

export type FindDocumentOptions = z.infer<typeof FindDocumentOptions>;
