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

type Props<T extends ProgrammingPlanSettings> = {
  settingKey: ProgrammingPlanSettingKey;
  label: string;
  settings: T;
  planSettings: ProgrammingPlanSettings | undefined;
  onChange: (settings: T) => void;
  children: (disabled: boolean, label: ReactNode) => ReactNode;
};

export const ProgrammingPlanSettingInheritance = <
  T extends ProgrammingPlanSettings
>({
  settingKey,
  label,
  settings,
  planSettings,
  onChange,
  children,
  ..._rest
}: Props<T>) => {
  assert<Equals<keyof typeof _rest, never>>();

  const managed = settings[managedKey(settingKey)];
  const managedAtPlanLevel = planSettings?.[managedKey(settingKey)] ?? false;
  const isInherited = managedAtPlanLevel && !managed;

  const change = (patch: Partial<ProgrammingPlanSettings>) =>
    onChange({ ...settings, ...patch });

  const composedLabel = (
    <span
      className="setting-inheritance-label"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
    >
      {managedAtPlanLevel && (
        <SettingInheritanceLockButton
          isInherited={isInherited}
          title={isInherited ? 'Géré par le plan' : 'Détaché du plan'}
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
      )}
      {label}
    </span>
  );

  return (
    <div
      className={clsx(
        'programming-plan-setting-inheritance',
        'd-flex-row',
        'd-flex-align-start'
      )}
      style={{ gap: '0.5rem' }}
    >
      <div style={{ flex: 1 }}>
        {children(isInherited || (!planSettings && !managed), composedLabel)}
      </div>
      {!planSettings && (
        <ToggleSwitch
          label={null}
          labelPosition="left"
          showCheckedHint={false}
          inputTitle={`Paramétrer « ${label} » au niveau du plan`}
          checked={managed}
          onChange={(managed) => change({ [managedKey(settingKey)]: managed })}
        />
      )}
    </div>
  );
};
