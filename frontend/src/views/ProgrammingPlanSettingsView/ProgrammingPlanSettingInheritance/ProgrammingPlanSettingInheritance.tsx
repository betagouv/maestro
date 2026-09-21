import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import {
  managedKey,
  type ProgrammingPlanSettingKey,
  type ProgrammingPlanSettings
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings';
import type { ReactNode } from 'react';
import { assert, type Equals } from 'tsafe';
import { SettingInheritanceLockButton } from '../SettingInheritanceLockButton/SettingInheritanceLockButton';
import './ProgrammingPlanSettingInheritance.scss';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';

type SettingInheritanceOptions<T extends ProgrammingPlanSettings> = {
  settingKey: ProgrammingPlanSettingKey;
  label: string;
  settings: T;
  planSettings: ProgrammingPlanSettings | undefined;
  inheritanceDisabledReason?: string;
  onChange: (settings: T) => void;
};

export const useSettingInheritance = <T extends ProgrammingPlanSettings>({
  settingKey,
  label,
  settings,
  planSettings,
  inheritanceDisabledReason,
  onChange
}: SettingInheritanceOptions<T>) => {
  const managed = settings[managedKey(settingKey)];
  const managedAtPlanLevel = planSettings?.[managedKey(settingKey)] ?? false;
  const isInherited = managedAtPlanLevel && !managed;

  const change = (patch: Partial<ProgrammingPlanSettings>) =>
    onChange({ ...settings, ...patch });

  return {
    isInherited,
    isFieldVisible: planSettings !== undefined || managed,
    required: managed,
    lockButton: managedAtPlanLevel && (
      <SettingInheritanceLockButton
        isInherited={isInherited}
        title={
          inheritanceDisabledReason ??
          (isInherited ? 'Géré par le plan' : 'Détaché du plan')
        }
        disabled={inheritanceDisabledReason !== undefined}
        onClick={() =>
          change(
            isInherited
              ? { [managedKey(settingKey)]: true }
              : {
                  [managedKey(settingKey)]: false,
                  [settingKey]: planSettings?.[settingKey]
                }
          )
        }
      />
    ),
    toggle: !planSettings && (
      <ToggleSwitch
        label={null}
        labelPosition="left"
        showCheckedHint={false}
        inputTitle={`Paramétrer « ${label} » au niveau du plan`}
        disabled={inheritanceDisabledReason !== undefined}
        checked={managed}
        onChange={(managed) => change({ [managedKey(settingKey)]: managed })}
      />
    ),
    disabledReasonHint: !planSettings && inheritanceDisabledReason && (
      <p className={cx('fr-hint-text', 'fr-mb-0')}>
        {inheritanceDisabledReason}
      </p>
    )
  };
};

type Props<T extends ProgrammingPlanSettings> = SettingInheritanceOptions<T> & {
  children: (props: {
    disabled: boolean;
    label: ReactNode;
    required: boolean;
  }) => ReactNode;
};

export const ProgrammingPlanSettingInheritance = <
  T extends ProgrammingPlanSettings
>({
  settingKey,
  label,
  settings,
  planSettings,
  inheritanceDisabledReason,
  onChange,
  children,
  ..._rest
}: Props<T>) => {
  assert<Equals<keyof typeof _rest, never>>();

  const {
    isInherited,
    isFieldVisible,
    required,
    lockButton,
    toggle,
    disabledReasonHint
  } = useSettingInheritance({
    settingKey,
    label,
    settings,
    planSettings,
    inheritanceDisabledReason,
    onChange
  });

  const composedLabel = (
    <span
      className="setting-inheritance-label"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
    >
      {lockButton}
      {label}
    </span>
  );

  return (
    <div
      className={clsx(
        'programming-plan-setting-inheritance',
        'd-flex-row',
        isFieldVisible ? 'd-flex-align-start' : 'd-flex-align-center',
        'border',
        cx('fr-p-2w')
      )}
      style={{ gap: '0.5rem' }}
    >
      <div style={{ flex: 1 }}>
        {isFieldVisible ? (
          children({
            disabled: isInherited,
            label: composedLabel,
            required
          })
        ) : (
          <span className={cx('fr-label', 'fr-label--disabled')}>{label}</span>
        )}
        {disabledReasonHint}
      </div>
      {toggle}
    </div>
  );
};
