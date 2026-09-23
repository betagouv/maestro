import { z } from 'zod';
import { checkSchema, refineSchema } from '../../utils/zod';
import { DocumentBase } from '../Document/Document';
import {
  ProgrammingPlanFieldSetting,
  ProgrammingSubPlanFieldSetting
} from '../SpecificData/FieldConfigInput';
import { samplesCoverageIssues } from './completedSubPlanSettings';
import { ProgrammingPlanNationalCoordinator } from './ProgrammingPlanNationalCoordinator';
import {
  isMissingSetting,
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

const inheritedMissingSettingMessage =
  'Ce paramètre est hérité du plan, qui ne l’a pas encore renseigné.';

const checkCompleteness =
  (level: 'plan' | 'subPlan') =>
  (ctx: z.core.ParsePayload<z.infer<typeof SettingsFormBase>>) => {
    if (!ctx.value.settingsCompleted) {
      return;
    }
    for (const settingKey of ProgrammingPlanSettingKey.options) {
      const managed = ctx.value[managedKey(settingKey)];
      if (
        (managed || level === 'subPlan') &&
        isMissingSetting(ctx.value[settingKey])
      ) {
        ctx.issues.push({
          input: ctx.value,
          code: 'custom',
          message: managed
            ? missingSettingMessages[settingKey]
            : inheritedMissingSettingMessage,
          path: [settingKey]
        });
      }
    }
  };

const checkSamplesCoverSubstanceKinds =
  (level: 'plan' | 'subPlan') =>
  (ctx: z.core.ParsePayload<z.infer<typeof SettingsFormBase>>) => {
    const { settingsCompleted, samplesManaged, samples, substanceKinds } =
      ctx.value;
    if (
      !settingsCompleted ||
      (!samplesManaged && level === 'plan') ||
      !samples
    ) {
      return;
    }
    for (const { path, message } of samplesCoverageIssues(
      samples,
      substanceKinds ?? []
    )) {
      ctx.issues.push({ input: ctx.value, code: 'custom', message, path });
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

export const ProgrammingPlanTechnicalInstruction = DocumentBase.pick({
  id: true,
  filename: true
});
export type ProgrammingPlanTechnicalInstruction = z.infer<
  typeof ProgrammingPlanTechnicalInstruction
>;

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
    technicalInstruction: ProgrammingPlanTechnicalInstruction.nullable(),
    fields: refineSchema(
      z.array(ProgrammingPlanFieldSetting),
      hasUniqueFields,
      uniqueFieldsMessage
    )
  }),
  checkCompleteness('plan'),
  checkSamplesCoverSubstanceKinds('plan')
  // checkNationalCoordinators
);
export type ProgrammingPlanSettingsForm = z.infer<
  typeof ProgrammingPlanSettingsForm
>;

export const ProgrammingSubPlanSettingsForm = checkSchema(
  SubPlanSettingsFormShape,
  checkCompleteness('subPlan'),
  checkSamplesCoverSubstanceKinds('subPlan')
);
export type ProgrammingSubPlanSettingsForm = z.infer<
  typeof ProgrammingSubPlanSettingsForm
>;

const ProgrammingLevelSettingsFormShape = SubPlanSettingsFormShape.extend({
  nationalCoordinators: z.array(ProgrammingPlanNationalCoordinator).nullable(),
  technicalInstruction: ProgrammingPlanTechnicalInstruction.nullable()
});

export const ProgrammingLevelSettingsForm = checkSchema(
  ProgrammingLevelSettingsFormShape,
  checkCompleteness('plan'),
  checkSamplesCoverSubstanceKinds('plan')
  //checkNationalCoordinators
);
export type ProgrammingLevelSettingsForm = z.infer<
  typeof ProgrammingLevelSettingsForm
>;

export const ProgrammingSubPlanLevelSettingsForm = checkSchema(
  ProgrammingLevelSettingsFormShape,
  checkCompleteness('subPlan'),
  checkSamplesCoverSubstanceKinds('subPlan')
);
