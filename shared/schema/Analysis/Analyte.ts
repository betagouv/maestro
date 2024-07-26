import { z } from 'zod';
import { Analyte as AnalyteReference } from '../../referential/Residue/Analyte';
import { ResultKind } from './Residue/ResultKind';

export const Analyte = z.object({
  analysisId: z.string().uuid(),
  residueNumber: z.number().int().positive(),
  analyteNumber: z.number().int().positive(),
  reference: AnalyteReference,
  resultKind: ResultKind,
  result: z.number().min(0).nullish(),
});

export const PartialAnalyte = Analyte.partial().merge(
  Analyte.pick({
    analysisId: true,
    residueNumber: true,
    analyteNumber: true,
  })
);

export type Analyte = z.infer<typeof Analyte>;
export type PartialAnalyte = z.infer<typeof PartialAnalyte>;
