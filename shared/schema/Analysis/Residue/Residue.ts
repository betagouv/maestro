import { isNil } from 'lodash-es';
import { CheckFn } from 'zod/dist/types/v4/core';
import { z } from 'zod/v4';
import { OptionalBoolean } from '../../../referential/OptionnalBoolean';
import { SSD2Id } from '../../../referential/Residue/SSD2Id';
import { maestroDate } from '../../../utils/date';
import { Sample } from '../../Sample/Sample';
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
  resultKind: ResultKind,
  result: z.number().min(0).nullish(),
  lmr: z.number().nullish(),
  resultHigherThanArfd: OptionalBoolean.nullish(),
  notesOnResult: z.string().nullish(),
  substanceApproved: OptionalBoolean,
  substanceAuthorised: OptionalBoolean,
  pollutionRisk: OptionalBoolean.nullish(),
  notesOnPollutionRisk: z.string().nullish(),
  compliance: ResidueCompliance,
  otherCompliance: z.string().nullish(),
  analytes: z.array(Analyte).nullish()
});

export const Residue = ResidueBase.check((ctx) => {
  if (ctx.value.compliance === 'Other' && !ctx.value.otherCompliance) {
    ctx.issues.push({
      input: ctx.value,
      code: 'custom',
      message: 'Veuillez préciser la conformité la conformité “Autre”.',
      path: ['otherCompliance']
    });
  }

  if (ctx.value.resultKind === 'Q') {
    if (isNil(ctx.value.result) || ctx.value.result === 0) {
      ctx.issues.push({
        input: ctx.value,
        code: 'custom',
        message: 'Veuillez préciser le résultat',
        path: ['result']
      });
    }
  }
});

const sampleResidueLmrCheck: CheckFn<
  Pick<Sample, 'stage' | 'specificData'> & Pick<Residue, 'resultKind' | 'lmr'>
> = (ctx) => {
  // La LMR est obligatoire lorsque les inspecteurs ont saisi dans la description du prélèvement:
  // - Le résultat est quantifiable
  // - Stade de prélèvement -> n'est pas « en cours de culture » (uniquement pour la PPV donc)
  // - Et LMR / Partie du végétal concernée -> n'est pas « Partie non LMR »
  if (
    ctx.value.resultKind === 'Q' &&
    ctx.value.specificData.programmingPlanKind === 'PPV' &&
    ctx.value.specificData.matrixPart === 'PART1' &&
    ctx.value.stage !== 'STADE2'
  ) {
    if (isNil(ctx.value.lmr) || ctx.value.lmr === 0) {
      ctx.issues.push({
        input: ctx.value,
        code: 'custom',
        message: 'Veuillez préciser la LMR',
        path: ['lmr']
      });
    }
  }
};

const LmrCheck = z
  .object({
    ...Sample.pick({
      stage: true,
      specificData: true
    }).shape,
    ...ResidueBase.pick({
      resultKind: true,
      lmr: true
    }).shape
  })
  .check(sampleResidueLmrCheck);

export const LmrIsValid = (sample: z.infer<typeof LmrCheck>): boolean =>
  LmrCheck.safeParse(sample).success;

export const PartialResidue = z.object({
  ...ResidueBase.partial().shape,
  ...ResidueBase.pick({
    analysisId: true,
    residueNumber: true,
    resultKind: true
  }).shape,

  analytes: z.array(PartialAnalyte).nullish()
});

export const ResidueLmrCheck = z
  .object({
    ...Residue.shape,
    ...LmrCheck.shape
  })
  .check(sampleResidueLmrCheck);

export type Residue = z.infer<typeof Residue>;
export type PartialResidue = z.infer<typeof PartialResidue>;
export type ResidueLmrCheck = z.infer<typeof ResidueLmrCheck>;
