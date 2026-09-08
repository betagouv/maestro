import { z } from 'zod';
import { refineSchema } from '../../utils/zod';
import {
  ProgrammingPlanFieldSetting,
  ProgrammingSubPlanFieldSetting
} from '../SpecificData/FieldConfigInput';
import { ProgrammingPlanSettings } from './ProgrammingPlanSettings';

const hasUniqueFields = (fields: { fieldId: string }[]): boolean =>
  new Set(fields.map(({ fieldId }) => fieldId)).size === fields.length;

const uniqueFieldsMessage =
  'Un descripteur ne peut apparaître qu’une fois dans le formulaire';

export const ProgrammingPlanSettingsForm = ProgrammingPlanSettings.extend({
  fields: refineSchema(
    z.array(ProgrammingPlanFieldSetting),
    hasUniqueFields,
    uniqueFieldsMessage
  )
});
export type ProgrammingPlanSettingsForm = z.infer<
  typeof ProgrammingPlanSettingsForm
>;

export const ProgrammingSubPlanSettingsForm = ProgrammingPlanSettings.extend({
  fields: refineSchema(
    z.array(ProgrammingSubPlanFieldSetting),
    hasUniqueFields,
    uniqueFieldsMessage
  )
});
export type ProgrammingSubPlanSettingsForm = z.infer<
  typeof ProgrammingSubPlanSettingsForm
>;
