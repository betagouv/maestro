import { z } from 'zod';
import { checkSchema, refineSchema } from '../../utils/zod';
import {
  ProgrammingPlanFieldSetting,
  ProgrammingSubPlanFieldSetting
} from '../SpecificData/FieldConfigInput';
import { ProgrammingPlanSettings } from './ProgrammingPlanSettings';

const hasUniqueFields = (fields: { fieldId: string }[]): boolean =>
  new Set(fields.map(({ fieldId }) => fieldId)).size === fields.length;

const uniqueFieldsMessage =
  'Un descripteur ne peut apparaître qu’une fois dans le formulaire';

const SettingsFormBase = ProgrammingPlanSettings.extend({
  settingsCompleted: z.boolean()
});

const checkCompleteness = (
  ctx: z.core.ParsePayload<z.infer<typeof SettingsFormBase>>
) => {
  if (
    ctx.value.settingsCompleted &&
    ctx.value.stagesManaged &&
    !ctx.value.stages?.length
  ) {
    ctx.issues.push({
      input: ctx.value,
      code: 'custom',
      message: 'Veuillez renseigner au moins un stade de prélèvement.',
      path: ['stages']
    });
  }
};

export const ProgrammingPlanSettingsForm = checkSchema(
  SettingsFormBase.extend({
    fields: refineSchema(
      z.array(ProgrammingPlanFieldSetting),
      hasUniqueFields,
      uniqueFieldsMessage
    )
  }),
  checkCompleteness
);
export type ProgrammingPlanSettingsForm = z.infer<
  typeof ProgrammingPlanSettingsForm
>;

export const ProgrammingSubPlanSettingsForm = checkSchema(
  SettingsFormBase.extend({
    fields: refineSchema(
      z.array(ProgrammingSubPlanFieldSetting),
      hasUniqueFields,
      uniqueFieldsMessage
    )
  }),
  checkCompleteness
);
export type ProgrammingSubPlanSettingsForm = z.infer<
  typeof ProgrammingSubPlanSettingsForm
>;
