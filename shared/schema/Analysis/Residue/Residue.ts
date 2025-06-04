import { isNil } from 'lodash-es';
import { z } from 'zod/v4';
import { OptionalBoolean } from '../../../referential/OptionnalBoolean';
import { SSD2Id } from '../../../referential/Residue/SSD2Id';
import { maestroDate } from '../../../utils/date';
import { AnalysisMethod } from '../AnalysisMethod';
import { Analyte, PartialAnalyte } from '../Analyte';
import { ResidueCompliance } from './ResidueCompliance';
import { ResultKind } from './ResultKind';

const ResidueBase = z.object({
  analysisId: z.guid(),
  residueNumber: z.number().int().positive(),
  analysisMethod: AnalysisMethod,
  analysisDate: maestroDate.nullish(),
  reference: SSD2Id,
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

export const Residue = ResidueBase.superRefine((residu, ctx) => {
  if (residu.compliance === 'Other' && !residu.otherCompliance) {
    ctx.addIssue({
      code: 'custom',
      message: 'Veuillez préciser la conformité la conformité “Autre”.',
      path: ['otherCompliance']
    });
  }
  if (residu.resultKind === 'Q') {
    if (isNil(residu.result) || residu.result === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Veuillez préciser le résultat',
        path: ['result']
      });
    }
    if (isNil(residu.lmr) || residu.lmr === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Veuillez préciser la LMR',
        path: ['lmr']
      });
    }
  }
});

export const PartialResidue = z.object({
  ...ResidueBase.partial().shape,
  ...ResidueBase.pick({
    analysisId: true,
    residueNumber: true
  }).shape,

  analytes: z.array(PartialAnalyte).nullish()
});

export type Residue = z.infer<typeof Residue>;
export type PartialResidue = z.infer<typeof PartialResidue>;
