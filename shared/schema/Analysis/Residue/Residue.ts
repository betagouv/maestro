import { isNil } from 'lodash-es';
import { z } from 'zod';
import type { CheckFn } from 'zod/v4/core';
import { OptionalBoolean } from '../../../referential/OptionnalBoolean';
import { isComplex } from '../../../referential/Residue/SSD2Hierarchy';
import { SSD2Id, SSD2Ids } from '../../../referential/Residue/SSD2Id';
import { SSD2Referential } from '../../../referential/Residue/SSD2Referential';
import { maestroDateRefined } from '../../../utils/date';
import { checkSchema } from '../../../utils/zod';
import { SampleBase } from '../../Sample/Sample';
import { AnalysisMethod } from '../AnalysisMethod';
import { Analyte, PartialAnalyte } from '../Analyte';
import { ContaminationSource } from './ContaminationSource';
import { ResidueCompliance } from './ResidueCompliance';
import { ResultKind } from './ResultKind';

const ResidueBase = z.object({
  analysisId: z.guid(),
  residueNumber: z.number().int().positive(),
  analysisMethod: AnalysisMethod,
  analysisDate: maestroDateRefined.nullish(),
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
  analytes: z.array(Analyte).nullish(),
  contaminationSources: z.array(ContaminationSource).nullish(),
  notesOnContaminationSources: z.string().nullish()
});

const sampleResidueCheck: CheckFn<z.infer<typeof ResidueBase>> = (ctx) => {
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

  if (
    ctx.value.contaminationSources &&
    ctx.value.contaminationSources.length > 0 &&
    !ctx.value.notesOnContaminationSources
  ) {
    ctx.issues.push({
      input: ctx.value,
      code: 'custom',
      message:
        'Veuillez renseigner les informations / compléments relatifs aux sources de contamination.',
      path: ['notesOnContaminationSources']
    });
  }
};

export const ResidueChecked = checkSchema(ResidueBase, sampleResidueCheck);
const sampleResidueLmrCheck: CheckFn<
  Pick<z.infer<typeof SampleBase>, 'stage' | 'specificData'> & {
    programmingSubPlanNumber: string;
  } & Pick<z.infer<typeof ResidueBase>, 'resultKind' | 'lmr' | 'reference'>
> = (ctx) => {
  if (
    !LmrIsValid({
      ...ctx.value,
      matrixPart: ctx.value.specificData?.matrixPart as string | undefined
    })
  ) {
    ctx.issues.push({
      input: ctx.value,
      code: 'custom',
      message: 'Veuillez préciser la LMR',
      path: ['lmr']
    });
  }
};

const LmrCheckChecked = checkSchema(
  z.object({
    ...SampleBase.pick({
      stage: true,
      specificData: true
    }).shape,
    programmingSubPlanNumber: z.string(),
    ...ResidueBase.pick({
      resultKind: true,
      lmr: true,
      reference: true
    }).shape
  }),
  sampleResidueLmrCheck
);

export const LmrIsValid = (
  sample: Pick<
    z.infer<typeof LmrCheckChecked>,
    'reference' | 'resultKind' | 'programmingSubPlanNumber' | 'stage' | 'lmr'
  > & {
    matrixPart: string | undefined;
  }
): boolean => {
  // La LMR n'est jamais requise lorsque le résultat n'est pas quantifiable.
  if (sample.resultKind !== 'Q') {
    return true;
  }

  // Une LMR renseignée est toujours valide.
  const lmrIsMissing = isNil(sample.lmr) || sample.lmr === 0;
  if (!lmrIsMissing) {
    return true;
  }

  // Hors PPV, la LMR est obligatoire.
  if (sample.programmingSubPlanNumber !== 'PPV') {
    return false;
  }

  let lmrCanBeOptional: boolean = false;
  if (sample.reference && SSD2Ids.includes(sample.reference)) {
    lmrCanBeOptional =
      'lmrCanBeOptional' in
      SSD2Referential[sample.reference as keyof typeof SSD2Referential];
  }

  // En PPV, la LMR est obligatoire lorsque les inspecteurs ont saisi dans la description du prélèvement:
  // - Stade de prélèvement -> n'est pas « en cours de culture »
  // - Et LMR / Partie du végétal concernée -> n'est pas « Partie non LMR »
  return !(
    sample.matrixPart === 'PART1' &&
    sample.stage !== 'STADE2' &&
    !lmrCanBeOptional
  );
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

export const ResidueLmrChecked = checkSchema(
  z.object({
    ...ResidueChecked.shape,
    ...LmrCheckChecked.shape
  }),
  sampleResidueCheck,
  sampleResidueLmrCheck
);

export type ResidueChecked = z.infer<typeof ResidueChecked>;
export type PartialResidue = z.infer<typeof PartialResidue>;
export type ResidueLmrChecked = z.infer<typeof ResidueLmrChecked>;
