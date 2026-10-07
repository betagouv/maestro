import { isNil, pick } from 'lodash-es';
import { z } from 'zod';
import { SSD2Id } from '../../referential/Residue/SSD2Id';
import { Stage } from '../../referential/Stage';
import { SubstanceKind } from '../Substance/SubstanceKind';
import { ProgrammingPlanContext } from './Context';
import {
  ProgrammingPlanSampleMaxCount,
  ProgrammingPlanSampleSetting
} from './ProgrammingPlanSampleSetting';
import { SubPlanMatrices } from './SubPlanMatrices';

export const ProgrammingPlanSettingKey = z.enum([
  'stages',
  'substanceKinds',
  'samples',
  'matrices',
  'context',
  'programmingInstruction',
  'notes',
  'monoSubstances',
  'multiSubstances'
]);
export type ProgrammingPlanSettingKey = z.infer<
  typeof ProgrammingPlanSettingKey
>;

export const ProgrammingPlanRequiredSettingKey =
  ProgrammingPlanSettingKey.exclude([
    'programmingInstruction',
    'notes',
    'monoSubstances',
    'multiSubstances'
  ]);
export type ProgrammingPlanRequiredSettingKey = z.infer<
  typeof ProgrammingPlanRequiredSettingKey
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
  samplesManaged: z.boolean(),
  matrices: SubPlanMatrices.nullable(),
  matricesManaged: z.boolean(),
  context: ProgrammingPlanContext.nullable(),
  contextManaged: z.boolean(),
  programmingInstruction: z.string().nullable(),
  programmingInstructionManaged: z.boolean(),
  notes: z.string().nullable(),
  notesManaged: z.boolean(),
  monoSubstances: z.array(SSD2Id).nullable(),
  monoSubstancesManaged: z.boolean(),
  multiSubstances: z.array(SSD2Id).nullable(),
  multiSubstancesManaged: z.boolean()
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

export const isMissingSetting = (
  value: unknown[] | SubPlanMatrices | ProgrammingPlanContext | null
): boolean => isNil(value) || (Array.isArray(value) && value.length === 0);

export const SubstanceKindsDependentSettingKey =
  ProgrammingPlanSettingKey.extract([
    'samples',
    'monoSubstances',
    'multiSubstances'
  ]);

export const managesAboveSubstanceKinds = {
  plan: (planSettings: ProgrammingPlanSettings): boolean =>
    !planSettings.substanceKindsManaged &&
    SubstanceKindsDependentSettingKey.options.some(
      (settingKey) => planSettings[managedKey(settingKey)]
    ),
  subPlan: (subPlanSettings: ProgrammingPlanSettings): boolean =>
    subPlanSettings.substanceKindsManaged &&
    SubstanceKindsDependentSettingKey.options.some(
      (settingKey) => !subPlanSettings[managedKey(settingKey)]
    )
};

export const withSettingsBelowSubstanceKinds = <
  T extends ProgrammingPlanSettings
>(
  settings: T,
  planSettings: ProgrammingPlanSettings | undefined
): T => {
  if (!planSettings) {
    return managesAboveSubstanceKinds.plan(settings)
      ? {
          ...settings,
          ...Object.fromEntries(
            SubstanceKindsDependentSettingKey.options.map((settingKey) => [
              managedKey(settingKey),
              false
            ])
          )
        }
      : settings;
  }
  return managesAboveSubstanceKinds.subPlan(settings)
    ? {
        ...settings,
        ...Object.fromEntries(
          SubstanceKindsDependentSettingKey.options
            .filter((settingKey) => !settings[managedKey(settingKey)])
            .flatMap((settingKey) => [
              [settingKey, planSettings[settingKey]],
              [managedKey(settingKey), true]
            ])
        )
      }
    : settings;
};
