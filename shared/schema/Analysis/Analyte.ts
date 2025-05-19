import { z } from 'zod';
import { SSD2Id } from '../../referential/Residue/SSD2Id';
import { ResultKind } from './Residue/ResultKind';

export const Analyte = z.object({
  analysisId: z.string().uuid(),
  residueNumber: z.number().int().positive(),
  analyteNumber: z.number().int().positive(),
  reference: SSD2Id,
  resultKind: ResultKind,
  result: z.number().min(0).nullish()
});

export const PartialAnalyte = z.object({
  ...Analyte.partial().shape,
  ...Analyte.pick({
    analysisId: true,
    residueNumber: true,
    analyteNumber: true
  }).shape
});

export type Analyte = z.infer<typeof Analyte>;
export type PartialAnalyte = z.infer<typeof PartialAnalyte>;
