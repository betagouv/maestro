import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import type { ProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings';
import type { ProgrammingLevelSettingsForm } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettingsForm';
import {
  type SampleProcedure,
  SampleProcedureKey,
  SampleProcedureLabels
} from 'maestro-shared/schema/ProgrammingPlan/SampleProcedure';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import type { UseForm } from 'src/hooks/useForm';
import { assert, type Equals } from 'tsafe';
import { useSettingInheritance } from '../ProgrammingPlanSettingInheritance/ProgrammingPlanSettingInheritance';
import './ProgrammingPlanSampleSettings.scss';

type Props<T extends ProgrammingPlanSettings> = {
  settings: T;
  planSettings: ProgrammingPlanSettings | undefined;
  inputForm: UseForm<typeof ProgrammingLevelSettingsForm>;
  onChange: (settings: T) => void;
};

export const ProgrammingPlanSampleProcedureSettings = <
  T extends ProgrammingPlanSettings
>({
  settings,
  planSettings,
  inputForm,
  onChange,
  ..._rest
}: Props<T>) => {
  assert<Equals<keyof typeof _rest, never>>();

  const {
    isInherited: disabled,
    isFieldVisible,
    lockButton,
    toggle
  } = useSettingInheritance({
    settingKey: 'sampleProcedure',
    label: 'Modalités d’échantillonnage',
    settings,
    planSettings,
    onChange
  });

  const changeField = (changedKey: SampleProcedureKey, value: string) => {
    const sampleProcedure = Object.fromEntries(
      SampleProcedureKey.options.map((key) => [
        key,
        key === changedKey
          ? value || null
          : (settings.sampleProcedure?.[key] ?? null)
      ])
    ) as SampleProcedure;
    onChange({
      ...settings,
      sampleProcedure: Object.values(sampleProcedure).some(Boolean)
        ? sampleProcedure
        : null
    });
  };

  return (
    <div className={clsx('programming-plan-sample-settings', cx('fr-mt-5w'))}>
      <div
        className={clsx(
          'programming-plan-sample-settings__header',
          'd-flex-align-center'
        )}
      >
        {lockButton}
        <span className={cx('fr-text--bold', 'fr-mb-0')}>
          2. Modalités d’échantillonnage
        </span>
        <div className="programming-plan-sample-settings__rule" />
        {toggle}
      </div>
      {isFieldVisible && (
        <div>
          <p className={clsx(cx('fr-text--sm'), 'text-grey')}>
            Ces informations sont affichées aux utilisateurs et utilisatrices
            sur la programmation et sur la saisie d’un prélèvement.
          </p>
          {SampleProcedureKey.options.map((key) => (
            <AppTextInput
              key={key}
              value={settings.sampleProcedure?.[key] ?? ''}
              onChange={(event) => changeField(key, event.target.value)}
              inputForm={inputForm}
              inputKey="sampleProcedure"
              inputPathFromKey={[key]}
              label={SampleProcedureLabels[key]}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
};
