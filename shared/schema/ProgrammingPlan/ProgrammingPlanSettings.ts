import { pick } from 'lodash-es';
import { z } from 'zod';
import { Stage } from '../../referential/Stage';
import { SubstanceKind } from '../Substance/SubstanceKind';
import {
  ProgrammingPlanSampleMaxCount,
  ProgrammingPlanSampleSetting
} from './ProgrammingPlanSampleSetting';

export const ProgrammingPlanSettingKey = z.enum([
  'stages',
  'substanceKinds',
  'samples'
]);
export type ProgrammingPlanSettingKey = z.infer<
  typeof ProgrammingPlanSettingKey
>;

export const ProgrammingPlanSettings = z.object({
  stages: z.array(Stage).nullable(),
  stagesManaged: z.boolean(),
  substanceKinds: z.array(SubstanceKind).nullable(),
  substanceKindsManaged: z.boolean(),
  samples: z
    .array(ProgrammingPlanSampleSetting)
    .max(ProgrammingPlanSampleMaxCount)
    .nullable(),
  samplesManaged: z.boolean()
} satisfies Record<ProgrammingPlanSettingKey, z.ZodType> &
  Record<`${ProgrammingPlanSettingKey}Managed`, z.ZodType>);

export type ProgrammingPlanSettings = z.infer<typeof ProgrammingPlanSettings>;

export const managedKey = <K extends ProgrammingPlanSettingKey>(
  settingKey: K
) => `${settingKey}Managed` as const;

export const pickProgrammingPlanSettings = (
  settings: ProgrammingPlanSettings
): ProgrammingPlanSettings =>
  pick(settings, ProgrammingPlanSettings.keyof().options);

export const emptyProgrammingPlanSettings = (
  managed: boolean
): ProgrammingPlanSettings =>
  ProgrammingPlanSettings.parse(
    Object.fromEntries(
      ProgrammingPlanSettingKey.options.flatMap((settingKey) => [
        [settingKey, null],
        [managedKey(settingKey), managed]
      ])
    )
  );

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

export const managesSamplesAboveSubstanceKinds = {
  plan: (planSettings: ProgrammingPlanSettings): boolean =>
    planSettings.samplesManaged && !planSettings.substanceKindsManaged,
  subPlan: (subPlanSettings: ProgrammingPlanSettings): boolean =>
    subPlanSettings.substanceKindsManaged && !subPlanSettings.samplesManaged
};

export const withSamplesBelowSubstanceKinds = <
  T extends ProgrammingPlanSettings
>(
  settings: T,
  planSettings: ProgrammingPlanSettings | undefined
): T => {
  if (!planSettings) {
    return managesSamplesAboveSubstanceKinds.plan(settings)
      ? { ...settings, samplesManaged: false }
      : settings;
  }
  return managesSamplesAboveSubstanceKinds.subPlan(settings)
    ? { ...settings, samples: planSettings.samples, samplesManaged: true }
    : settings;
};
