import { z } from 'zod';
import { checkSchema, refineSchema } from '../../utils/zod';
import {
  ProgrammingPlanFieldSetting,
  ProgrammingSubPlanFieldSetting
} from '../SpecificData/FieldConfigInput';
import { ProgrammingPlanNationalCoordinator } from './ProgrammingPlanNationalCoordinator';
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
  checkCompleteness
  // checkNationalCoordinators
);
export type ProgrammingPlanSettingsForm = z.infer<
  typeof ProgrammingPlanSettingsForm
>;

export const ProgrammingSubPlanSettingsForm = checkSchema(
  SubPlanSettingsFormShape,
  checkCompleteness
);
export type ProgrammingSubPlanSettingsForm = z.infer<
  typeof ProgrammingSubPlanSettingsForm
>;

export const ProgrammingLevelSettingsForm = checkSchema(
  SubPlanSettingsFormShape.extend({
    nationalCoordinators: z.array(ProgrammingPlanNationalCoordinator).nullable()
  }),
  checkCompleteness
  //checkNationalCoordinators
);
export type ProgrammingLevelSettingsForm = z.infer<
  typeof ProgrammingLevelSettingsForm
>;
