import { isNil } from 'lodash-es';
import { z } from 'zod';
import { checkSchema, refineSchema } from '../../utils/zod';
import {
  ProgrammingPlanFieldSetting,
  ProgrammingSubPlanFieldSetting
} from '../SpecificData/FieldConfigInput';
import { SubstanceKindLabels } from '../Substance/SubstanceKind';
import { ProgrammingPlanNationalCoordinator } from './ProgrammingPlanNationalCoordinator';
import {
  managedKey,
  ProgrammingPlanSettingKey,
  ProgrammingPlanSettings
} from './ProgrammingPlanSettings';

const hasUniqueFields = (fields: { fieldId: string }[]): boolean =>
  new Set(fields.map(({ fieldId }) => fieldId)).size === fields.length;

const uniqueFieldsMessage =
  'Un descripteur ne peut apparaître qu’une fois dans le formulaire';

const SettingsFormBase = ProgrammingPlanSettings.extend({
  settingsCompleted: z.boolean()
});

const missingSettingMessages: Record<ProgrammingPlanSettingKey, string> = {
  stages: 'Veuillez renseigner au moins un stade de prélèvement.',
  substanceKinds: 'Veuillez renseigner au moins un analyte.',
  samples: 'Veuillez configurer au moins un échantillon.'
};

const checkCompleteness = (
  ctx: z.core.ParsePayload<z.infer<typeof SettingsFormBase>>
) => {
  if (!ctx.value.settingsCompleted) {
    return;
  }
  for (const settingKey of ProgrammingPlanSettingKey.options) {
    const value = ctx.value[settingKey];
    if (
      ctx.value[managedKey(settingKey)] &&
      (isNil(value) || value.length === 0)
    ) {
      ctx.issues.push({
        input: ctx.value,
        code: 'custom',
        message: missingSettingMessages[settingKey],
        path: [settingKey]
      });
    }
  }
};

const checkSamplesCoverSubstanceKinds = (
  ctx: z.core.ParsePayload<z.infer<typeof SettingsFormBase>>
) => {
  const { settingsCompleted, samplesManaged, samples, substanceKinds } =
    ctx.value;
  if (!settingsCompleted || !samplesManaged || !samples) {
    return;
  }
  samples.forEach((sample, index) => {
    const outsideSubstanceKind = sample.substanceKinds.find(
      (substanceKind) => !substanceKinds?.includes(substanceKind)
    );
    if (sample.substanceKinds.length === 0 || outsideSubstanceKind) {
      ctx.issues.push({
        input: ctx.value,
        code: 'custom',
        message: outsideSubstanceKind
          ? `L’analyte « ${SubstanceKindLabels[outsideSubstanceKind]} » de l’échantillon ${index + 1} ne fait pas partie des analytes.`
          : `Veuillez choisir au moins un analyte pour l’échantillon ${index + 1}.`,
        path: ['samples', index, 'substanceKinds']
      });
    }
  });
  for (const substanceKind of substanceKinds ?? []) {
    const sampleCount = samples.filter((sample) =>
      sample.substanceKinds.includes(substanceKind)
    ).length;
    if (sampleCount !== 1) {
      ctx.issues.push({
        input: ctx.value,
        code: 'custom',
        message:
          sampleCount === 0
            ? `L’analyte « ${SubstanceKindLabels[substanceKind]} » n’est affecté à aucun échantillon.`
            : `L’analyte « ${SubstanceKindLabels[substanceKind]} » est affecté à plusieurs échantillons.`,
        path: ['samples']
      });
    }
  }
};
// FIXME DOMAIN à décommenter quand tous les plans de la bdd de prod auront un coord et supprimer le .fail sur le test
// const checkNationalCoordinators = (
//   ctx: z.core.ParsePayload<{
//     settingsCompleted: boolean;
//     nationalCoordinators: ProgrammingPlanNationalCoordinator[] | null;
//   }>
// ) => {
//   if (
//     ctx.value.settingsCompleted &&
//     ctx.value.nationalCoordinators?.length === 0
//   ) {
//     ctx.issues.push({
//       input: ctx.value,
//       code: 'custom',
//       message: 'Veuillez renseigner au moins un coordinateur national.',
//       path: ['nationalCoordinators']
//     });
//   }
// };

const SubPlanSettingsFormShape = SettingsFormBase.extend({
  fields: refineSchema(
    z.array(ProgrammingSubPlanFieldSetting),
    hasUniqueFields,
    uniqueFieldsMessage
  )
});

export const ProgrammingPlanSettingsForm = checkSchema(
  SettingsFormBase.extend({
    nationalCoordinators: z.array(ProgrammingPlanNationalCoordinator),
    fields: refineSchema(
      z.array(ProgrammingPlanFieldSetting),
      hasUniqueFields,
      uniqueFieldsMessage
    )
  }),
  checkCompleteness,
  checkSamplesCoverSubstanceKinds
  // checkNationalCoordinators
);
export type ProgrammingPlanSettingsForm = z.infer<
  typeof ProgrammingPlanSettingsForm
>;

export const ProgrammingSubPlanSettingsForm = checkSchema(
  SubPlanSettingsFormShape,
  checkCompleteness,
  checkSamplesCoverSubstanceKinds
);
export type ProgrammingSubPlanSettingsForm = z.infer<
  typeof ProgrammingSubPlanSettingsForm
>;

export const ProgrammingLevelSettingsForm = checkSchema(
  SubPlanSettingsFormShape.extend({
    nationalCoordinators: z.array(ProgrammingPlanNationalCoordinator).nullable()
  }),
  checkCompleteness,
  checkSamplesCoverSubstanceKinds
  //checkNationalCoordinators
);
export type ProgrammingLevelSettingsForm = z.infer<
  typeof ProgrammingLevelSettingsForm
>;
