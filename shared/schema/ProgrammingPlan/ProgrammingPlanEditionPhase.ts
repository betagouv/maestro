import { isEqual, isNil, sortBy } from 'lodash-es';
import { z } from 'zod';
import type { ProgrammingPlanFieldSetting } from '../SpecificData/FieldConfigInput';
import type { FieldInheritance } from '../SpecificData/FieldInheritance';
import type { ProgrammingPlanNationalStatus } from './ProgrammingPlanLocalStatus';
import {
  managedKey,
  type ProgrammingPlanSettingKey,
  type ProgrammingPlanSettings
} from './ProgrammingPlanSettings';

export const ProgrammingPlanEditionPhase = z.enum([
  'Draft',
  'Submitted',
  'Launched'
]);
export type ProgrammingPlanEditionPhase = z.infer<
  typeof ProgrammingPlanEditionPhase
>;

export const programmingPlanEditionPhase = (plan: {
  launchedAt?: Date | null;
  nationalStatus: Pick<ProgrammingPlanNationalStatus, 'status'>;
}): ProgrammingPlanEditionPhase =>
  !isNil(plan.launchedAt)
    ? 'Launched'
    : ['InProgress', 'SubmittedToAdmin'].includes(plan.nationalStatus.status)
      ? 'Draft'
      : 'Submitted';

const submittedLockedSettingKeys: ProgrammingPlanSettingKey[] = [
  'stages',
  'matrices',
  'substanceKinds',
  'context'
];

export const lockedSettingKeys: Record<
  ProgrammingPlanEditionPhase,
  ProgrammingPlanSettingKey[]
> = {
  Draft: [],
  Submitted: submittedLockedSettingKeys,
  Launched: [
    ...submittedLockedSettingKeys,
    'samples',
    'monoSubstances',
    'multiSubstances'
  ]
};

export const isSettingLocked = (
  phase: ProgrammingPlanEditionPhase,
  settingKey: ProgrammingPlanSettingKey
): boolean => lockedSettingKeys[phase].includes(settingKey);

export const areFieldsLocked = (phase: ProgrammingPlanEditionPhase): boolean =>
  phase === 'Launched';

export const lockedSettingReason = (
  phase: ProgrammingPlanEditionPhase
): string | undefined => {
  switch (phase) {
    case 'Draft':
      return undefined;
    case 'Submitted':
      return 'Non modifiable après la soumission du plan aux régions.';
    case 'Launched':
      return 'Non modifiable après le lancement de la campagne.';
  }
};

export const lockedSettingsChanged = (
  phase: ProgrammingPlanEditionPhase,
  stored: ProgrammingPlanSettings,
  body: ProgrammingPlanSettings
): boolean =>
  lockedSettingKeys[phase].some(
    (settingKey) =>
      stored[managedKey(settingKey)] !== body[managedKey(settingKey)] ||
      (body[managedKey(settingKey)] &&
        !isEqual(stored[settingKey], body[settingKey]))
  );

type LockableFieldSetting = ProgrammingPlanFieldSetting & {
  inheritance?: FieldInheritance;
};

const comparableFields = (fields: LockableFieldSetting[]) =>
  sortBy(
    fields.map(({ fieldId, required, optionIds, inheritance }) => ({
      fieldId,
      required,
      optionIds: [...optionIds].sort(),
      inheritance
    })),
    'fieldId'
  );

export const lockedFieldsChanged = (
  phase: ProgrammingPlanEditionPhase,
  stored: LockableFieldSetting[],
  body: LockableFieldSetting[]
): boolean =>
  areFieldsLocked(phase) &&
  !isEqual(comparableFields(stored), comparableFields(body));
