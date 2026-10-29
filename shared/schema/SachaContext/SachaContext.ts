import { groupBy } from 'lodash-es';
import { z } from 'zod';
import { SachaContextSigle } from '../ProgrammingPlan/ProgrammingSubPlan';
import {
  CommemoratifSigle,
  type CommemoratifValueSigle,
  type SachaCommemoratifRecord
} from '../SachaCommemoratif/SachaCommemoratif';
import type { FieldInheritance } from '../SpecificData/FieldInheritance';
import type {
  SpecificDataFieldId,
  SpecificDataFieldOptionId
} from '../SpecificData/ProgrammingSubPlanFieldConfig';

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
  fields: {
    fieldId: SpecificDataFieldId;
    inheritance: FieldInheritance;
    optionIds: SpecificDataFieldOptionId[];
  }[],
  fieldConfigs: {
    id: SpecificDataFieldId;
    label: string;
    sachaCommemoratifSigle: CommemoratifSigle | null;
    options: {
      id: SpecificDataFieldOptionId;
      label: string;
      sachaCommemoratifValueSigle: CommemoratifValueSigle | null;
    }[];
  }[],
  commemoratifs: SachaCommemoratifRecord
): string | undefined => {
  const activeFields = fields.filter(
    ({ inheritance }) => inheritance !== 'Excluded'
  );
  const contextFieldConfigs = fieldConfigs.filter(
    ({ sachaCommemoratifSigle }) =>
      sachaContext.commemoratifs.some(
        ({ sigle }) => sigle === sachaCommemoratifSigle
      )
  );

  const missingLabels = Object.values(
    groupBy(contextFieldConfigs, 'sachaCommemoratifSigle')
  )
    .filter((linkedFields) =>
      linkedFields.every(
        ({ id }) => !activeFields.some(({ fieldId }) => fieldId === id)
      )
    )
    .map((linkedFields) =>
      linkedFields.map(({ label }) => `« ${label} »`).join(' ou ')
    );

  const unmappedOptionsMessages = contextFieldConfigs.flatMap(
    ({ id, label, sachaCommemoratifSigle, options }) => {
      const commemoratif = sachaCommemoratifSigle
        ? commemoratifs[sachaCommemoratifSigle]
        : undefined;
      const field = activeFields.find(({ fieldId }) => fieldId === id);
      if (commemoratif?.typeDonnee !== 'list' || !field) {
        return [];
      }
      const unmappedLabels = options
        .filter(
          (option) =>
            field.optionIds.includes(option.id) &&
            !(
              option.sachaCommemoratifValueSigle &&
              commemoratif.values[option.sachaCommemoratifValueSigle]
            )
        )
        .map((option) => `« ${option.label} »`);
      if (unmappedLabels.length === 0) {
        return [];
      }
      return [
        unmappedLabels.length === 1
          ? `Le contexte d’intervention SIGAL ${sachaContext.sigle} transmet le descripteur « ${label} » : associez une valeur Sacha à son option ${unmappedLabels[0]} dans le dictionnaire des descripteurs.`
          : `Le contexte d’intervention SIGAL ${sachaContext.sigle} transmet le descripteur « ${label} » : associez une valeur Sacha à ses options ${unmappedLabels.join(', ')} dans le dictionnaire des descripteurs.`
      ];
    }
  );

  const messages = [
    ...(missingLabels.length === 0
      ? []
      : [
          missingLabels.length === 1
            ? `Le contexte d’intervention SIGAL ${sachaContext.sigle} demande le descripteur ${missingLabels[0]}.`
            : `Le contexte d’intervention SIGAL ${sachaContext.sigle} demande les descripteurs ${missingLabels.join(', ')}.`
        ]),
    ...unmappedOptionsMessages
  ];
  return messages.length === 0 ? undefined : messages.join(' ');
};
