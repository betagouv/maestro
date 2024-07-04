import { z } from 'zod';
import { ResultKind } from './ResultKind';

export const Analyte = z.object({
  residueId: z.string().uuid(),
  analyteNumber: z.number().int().positive(),
  analyte: z.string().optional().nullable(),
  kind: ResultKind.optional().nullable(),
  result: z.number().optional().nullable(),
});

export type Analyte = z.infer<typeof Analyte>;
