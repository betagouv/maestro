import { z } from 'zod';
import { OptionalBoolean } from '../../../referential/OptionnalBoolean';
import { SimpleResidue } from '../../../referential/Residue/SimpleResidue';
import { Analyte, PartialAnalyte } from '../Analyte';
import { ResidueCompliance } from './ResidueCompliance';
import { ResidueKind } from './ResidueKind';
import { ResultKind } from './ResultKind';

export const Residue = z.object({
  analysisId: z.string().uuid(),
  residueNumber: z.number().int().positive(),
  kind: ResidueKind,
  reference: SimpleResidue,
  resultKind: ResultKind,
  result: z.number().min(0).optional().nullable(),
  lmr: z.number().optional().nullable(),
  resultHigherThanArfd: OptionalBoolean,
  notesOnResult: z.string().optional().nullable(),
  substanceApproved: OptionalBoolean,
  substanceAuthorised: OptionalBoolean,
  pollutionRisk: OptionalBoolean.optional().nullable(),
  notesOnPollutionRisk: z.string().optional().nullable(),
  compliance: ResidueCompliance,
  analytes: z.array(Analyte).min(1, {
    message: 'Veuillez renseigner au moins un analyte.',
  }),
});

export const PartialResidue = Residue.partial().merge(
  Residue.pick({
    analysisId: true,
    residueNumber: true,
  }).merge(
    z.object({
      analytes: z.array(PartialAnalyte).optional().nullable(),
    })
  )
);

export type Residue = z.infer<typeof Residue>;
export type PartialResidue = z.infer<typeof PartialResidue>;
