import { z } from 'zod';
import { Stage } from '../../referential/Stage';

export const ProgrammingPlanSettingKey = z.enum(['stages']);
export type ProgrammingPlanSettingKey = z.infer<
  typeof ProgrammingPlanSettingKey
>;

export const ProgrammingPlanSettings = z.object({
  stages: z.array(Stage).nullable(),
  stagesManaged: z.boolean()
} satisfies Record<ProgrammingPlanSettingKey, z.ZodType> &
  Record<`${ProgrammingPlanSettingKey}Managed`, z.ZodType>);

export type ProgrammingPlanSettings = z.infer<typeof ProgrammingPlanSettings>;

export const managedKey = <K extends ProgrammingPlanSettingKey>(
  settingKey: K
) => `${settingKey}Managed` as const;

// Toutes les propriétés surchargeables doivent êtres managées soit par le plan soit par le
// sous-plan.
export const inheritsUnmanagedSetting = (
  subPlanSettings: ProgrammingPlanSettings,
  planSettings: ProgrammingPlanSettings
): boolean =>
  ProgrammingPlanSettingKey.options.some(
    (settingKey) =>
      !subPlanSettings[managedKey(settingKey)] &&
      !planSettings[managedKey(settingKey)]
  );
