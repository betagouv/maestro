import { z } from 'zod';
import { OptionalBoolean } from '../../../referential/OptionnalBoolean';
import { ComplexResidue } from '../../../referential/Residue/ComplexResidue';
import { SimpleResidue } from '../../../referential/Residue/SimpleResidue';
import { Analyte, PartialAnalyte } from '../Analyte';
import { ResidueCompliance } from './ResidueCompliance';
import { ResidueKind } from './ResidueKind';
import { ResultKind } from './ResultKind';

export const Residue = z.object({
  analysisId: z.string().uuid(),
  residueNumber: z.number().int().positive(),
  kind: ResidueKind,
  reference: z.union([SimpleResidue, ComplexResidue], {
    errorMap: () => ({
      message: 'Veuillez renseigner le résidu.',
    }),
  }),
  resultKind: ResultKind.nullish(),
  result: z.number().min(0).nullish(),
  lmr: z.number().nullish(),
  resultHigherThanArfd: OptionalBoolean.nullish(),
  notesOnResult: z.string().nullish(),
  substanceApproved: OptionalBoolean.nullish(),
  substanceAuthorised: OptionalBoolean.nullish(),
  pollutionRisk: OptionalBoolean.nullish(),
  notesOnPollutionRisk: z.string().nullish(),
  compliance: ResidueCompliance,
  analytes: z.array(Analyte).nullish(),
});

export const PartialResidue = Residue.partial().merge(
  Residue.pick({
    analysisId: true,
    residueNumber: true,
  }).merge(
    z.object({
      analytes: z.array(PartialAnalyte).nullish(),
    })
  )
);

export type Residue = z.infer<typeof Residue>;
export type PartialResidue = z.infer<typeof PartialResidue>;
