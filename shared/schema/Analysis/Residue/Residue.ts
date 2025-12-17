import { isNil } from 'lodash-es';
import { z } from 'zod';
import { CheckFn } from 'zod/v4/core';
import { OptionalBoolean } from '../../../referential/OptionnalBoolean';
import { isComplex } from '../../../referential/Residue/SSD2Hierarchy';
import { SSD2Id, SSD2Ids } from '../../../referential/Residue/SSD2Id';
import { SSD2Referential } from '../../../referential/Residue/SSD2Referential';
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

const sampleResidueCheck: CheckFn<Residue> = (ctx) => {
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

  if (
    isComplex(ctx.value.reference) &&
    (!ctx.value.analytes || ctx.value.analytes.length === 0)
  ) {
    ctx.issues.push({
      input: ctx.value,
      code: 'custom',
      message: 'Veuillez préciser au moins une analyte pour ce résidu complexe',
      path: ['analytes']
    });
  }
};

export const Residue = ResidueBase.check(sampleResidueCheck);
const sampleResidueLmrCheck: CheckFn<
  Pick<Sample, 'stage' | 'specificData'> &
    Pick<Residue, 'resultKind' | 'lmr' | 'reference'>
> = (ctx) => {
  if (!LmrIsValid(ctx.value)) {
    ctx.issues.push({
      input: ctx.value,
      code: 'custom',
      message: 'Veuillez préciser la LMR',
      path: ['lmr']
    });
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
      lmr: true,
      reference: true
    }).shape
  })
  .check(sampleResidueLmrCheck);

export const LmrIsValid = (sample: z.infer<typeof LmrCheck>): boolean => {
  let lmrCanBeOptional: boolean = false;
  if (sample.reference && SSD2Ids.includes(sample.reference)) {
    lmrCanBeOptional =
      'lmrCanBeOptional' in
      SSD2Referential[sample.reference as keyof typeof SSD2Referential];
  }
  // La LMR est obligatoire lorsque les inspecteurs ont saisi dans la description du prélèvement:
  // - Le résultat est quantifiable
  // - Stade de prélèvement -> n'est pas « en cours de culture » (uniquement pour la PPV donc)
  // - Et LMR / Partie du végétal concernée -> n'est pas « Partie non LMR »
  if (
    sample.resultKind === 'Q' &&
    sample.specificData.programmingPlanKind === 'PPV' &&
    sample.specificData.matrixPart === 'PART1' &&
    sample.stage !== 'STADE2' &&
    !lmrCanBeOptional
  ) {
    if (isNil(sample.lmr) || sample.lmr === 0) {
      return false;
    }
  }
  return true;
};

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
  .check(sampleResidueCheck)
  .check(sampleResidueLmrCheck);

export type Residue = z.infer<typeof Residue>;
export type PartialResidue = z.infer<typeof PartialResidue>;
export type ResidueLmrCheck = z.infer<typeof ResidueLmrCheck>;
