import { z } from 'zod';
import { OptionalBoolean } from '../../../referential/OptionnalBoolean';
import { ComplexResidue } from '../../../referential/Residue/ComplexResidue';
import { SimpleResidue } from '../../../referential/Residue/SimpleResidue';
import { AnalysisMethod } from '../AnalysisMethod';
import { Analyte, PartialAnalyte } from '../Analyte';
import { ResidueCompliance } from './ResidueCompliance';
import { ResidueKind } from './ResidueKind';
import { ResultKind } from './ResultKind';

const ResidueBase = z.object({
  analysisId: z.string().uuid(),
  residueNumber: z.number().int().positive(),
  analysisMethod: AnalysisMethod,
  kind: ResidueKind,
  reference: z.union([SimpleResidue, ComplexResidue], {
    errorMap: () => ({
      message: 'Veuillez renseigner le résidu.'
    })
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
  otherCompliance: z.string().nullish(),
  analytes: z.array(Analyte).nullish()
});

export const Residue = ResidueBase.refine(
  (data) => {
    if (data.compliance === 'Other') {
      return data.otherCompliance;
    }
    return true;
  },
  {
    message: 'Veuillez préciser la conformité la conformité “Autre”.',
    path: ['otherCompliance']
  }
);

export const PartialResidue = ResidueBase.partial().merge(
  ResidueBase.pick({
    analysisId: true,
    residueNumber: true
  }).merge(
    z.object({
      analytes: z.array(PartialAnalyte).nullish()
    })
  )
);

export type Residue = z.infer<typeof Residue>;
export type PartialResidue = z.infer<typeof PartialResidue>;
