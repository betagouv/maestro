import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import {
  type ProgrammingPlanSettings,
  SubstancesSettings
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings';
import type { ProgrammingLevelSettingsForm } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettingsForm';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import type { UseForm } from 'src/hooks/useForm';
import { assert, type Equals } from 'tsafe';
import SubstanceSearch from '../../../components/SubstanceSearch/SubstanceSearch';
import { ProgrammingPlanSettingInheritance } from '../ProgrammingPlanSettingInheritance/ProgrammingPlanSettingInheritance';
import './ProgrammingPlanAnalysisSettings.scss';

type Props<T extends ProgrammingPlanSettings> = {
  settings: T;
  planSettings: ProgrammingPlanSettings | undefined;
  inputForm: UseForm<typeof ProgrammingLevelSettingsForm>;
  onChange: (settings: T) => void;
};

export const ProgrammingPlanAnalysisSettings = <
  T extends ProgrammingPlanSettings
>({
  settings,
  planSettings,
  inputForm,
  onChange,
  ..._rest
}: Props<T>) => {
  assert<Equals<keyof typeof _rest, never>>();

  const inheritanceDisabledReason = planSettings
    ? settings.substanceKindsManaged
      ? 'Les analytes de ce sous-plan sont détachés du plan : ses substances le sont aussi.'
      : undefined
    : settings.substanceKindsManaged
      ? undefined
      : 'Paramétrez d’abord les analytes au niveau du plan.';

  return (
    <div
      className={clsx('programming-plan-analysis-settings', 'd-flex-column')}
    >
      {SubstancesSettings.filter(({ substanceKind }) =>
        settings.substanceKinds?.includes(substanceKind)
      ).map(({ settingKey, substanceKind }) => (
        <ProgrammingPlanSettingInheritance
          key={settingKey}
          settingKey={settingKey}
          label={`Spécification des substances actives ${SubstanceKindLabels[substanceKind]}`}
          labelContent={
            <span>
              Spécification des substances actives{' '}
              <Tag small as="span">
                {SubstanceKindLabels[substanceKind]}
              </Tag>
            </span>
          }
          settings={settings}
          planSettings={planSettings}
          inheritanceDisabledReason={inheritanceDisabledReason}
          onChange={onChange}
        >
          {({ disabled, label }) => (
            <>
              <SubstanceSearch
                label={label}
                analysisMethod={substanceKind}
                substances={settings[settingKey] ?? []}
                onChangeSubstances={(substances) =>
                  onChange({ ...settings, [settingKey]: substances })
                }
                readonly={disabled}
                addButtonMode="none"
              />
              {inputForm.hasIssue(settingKey) && (
                <div className={cx('fr-error-text')}>
                  {inputForm.message(settingKey)}
                </div>
              )}
            </>
          )}
        </ProgrammingPlanSettingInheritance>
      ))}
    </div>
  );
};
