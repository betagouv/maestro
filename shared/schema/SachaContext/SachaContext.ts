import { groupBy } from 'lodash-es';
import { z } from 'zod';
import { SachaContextSigle } from '../ProgrammingPlan/ProgrammingSubPlan';
import { CommemoratifSigle } from '../SachaCommemoratif/SachaCommemoratif';
import type { FieldInheritance } from '../SpecificData/FieldInheritance';
import type { SpecificDataFieldId } from '../SpecificData/ProgrammingSubPlanFieldConfig';

export const SachaCommemoratifLevel = z.enum(['Sample', 'SampleMatrix']);
export type SachaCommemoratifLevel = z.infer<typeof SachaCommemoratifLevel>;

export const SachaContext = z.object({
  sigle: SachaContextSigle,
  libelle: z.string(),
  commemoratifs: z.array(
    z.object({
      sigle: CommemoratifSigle,
      level: SachaCommemoratifLevel
    })
  )
});
export type SachaContext = z.infer<typeof SachaContext>;

export const SachaReferentialImport = z.object({
  kind: z.enum(['DS01', 'RP01']),
  fileName: z.string()
});
export type SachaReferentialImport = z.infer<typeof SachaReferentialImport>;

export const unusableSachaContextMessage = (sigle: SachaContextSigle) =>
  `Le contexte d’intervention SIGAL ${sigle} est gelé ou absent du référentiel.`;

export const sachaContextFieldsIssue = (
  sachaContext: SachaContext,
  fields: { fieldId: SpecificDataFieldId; inheritance: FieldInheritance }[],
  fieldConfigs: {
    id: SpecificDataFieldId;
    label: string;
    sachaCommemoratifSigle: CommemoratifSigle | null;
  }[]
): string | undefined => {
  const activeFieldIds = fields
    .filter(({ inheritance }) => inheritance !== 'Excluded')
    .map(({ fieldId }) => fieldId);
  const fieldConfigsBySigle = groupBy(
    fieldConfigs.filter(({ sachaCommemoratifSigle }) =>
      sachaContext.commemoratifs.some(
        ({ sigle }) => sigle === sachaCommemoratifSigle
      )
    ),
    'sachaCommemoratifSigle'
  );
  const missingLabels = Object.values(fieldConfigsBySigle)
    .filter((linkedFields) =>
      linkedFields.every(({ id }) => !activeFieldIds.includes(id))
    )
    .map((linkedFields) =>
      linkedFields.map(({ label }) => `« ${label} »`).join(' ou ')
    );

  if (missingLabels.length === 0) {
    return undefined;
  }
  return missingLabels.length === 1
    ? `Le contexte d’intervention SIGAL ${sachaContext.sigle} demande le descripteur ${missingLabels[0]}.`
    : `Le contexte d’intervention SIGAL ${sachaContext.sigle} demande les descripteurs ${missingLabels.join(', ')}.`;
};
