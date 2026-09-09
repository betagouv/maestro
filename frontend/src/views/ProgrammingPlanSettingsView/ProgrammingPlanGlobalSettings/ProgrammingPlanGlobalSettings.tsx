import { StageLabels, StageList } from 'maestro-shared/referential/Stage';
import type { ProgrammingPlanNationalCoordinator } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanNationalCoordinator';
import type { ProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings.ts';
import type { ProgrammingLevelSettingsForm } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettingsForm';
import { AppMultiSelect } from 'src/components/_app/AppMultiSelect/AppMultiSelect';
import type { UseForm } from 'src/hooks/useForm';
import { assert, type Equals } from 'tsafe';
import { ProgrammingPlanNationalCoordinators } from '../ProgrammingPlanNationalCoordinators/ProgrammingPlanNationalCoordinators';
import { ProgrammingPlanSettingInheritance } from '../ProgrammingPlanSettingInheritance/ProgrammingPlanSettingInheritance';

type Props<
  T extends ProgrammingPlanSettings & {
    nationalCoordinators: ProgrammingPlanNationalCoordinator[] | null;
  }
> = {
  settings: T;
  planSettings: ProgrammingPlanSettings | undefined;
  inputForm: UseForm<typeof ProgrammingLevelSettingsForm>;
  onChange: (settings: T) => void;
};

const stagesLabel = 'Stade(s) de prélèvement';

export const ProgrammingPlanGlobalSettings = <
  T extends ProgrammingPlanSettings & {
    nationalCoordinators: ProgrammingPlanNationalCoordinator[] | null;
  }
>({
  settings,
  planSettings,
  inputForm,
  onChange,
  ..._rest
}: Props<T>) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <>
      <ProgrammingPlanSettingInheritance
        settingKey="stages"
        label={stagesLabel}
        settings={settings}
        planSettings={planSettings}
        onChange={onChange}
      >
        {(disabled, label) => (
          <AppMultiSelect
            inputForm={inputForm}
            inputKey={'stages'}
            items={StageList}
            values={settings.stages ?? []}
            onChange={(stages) => onChange({ ...settings, stages })}
            keysWithLabels={StageLabels}
            defaultLabel={'stade sélectionné'}
            label={label}
            disabled={disabled}
            required
          />
        )}
      </ProgrammingPlanSettingInheritance>
      {settings.nationalCoordinators !== null && (
        <ProgrammingPlanNationalCoordinators
          nationalCoordinators={settings.nationalCoordinators}
          inputForm={inputForm}
          onChange={(nationalCoordinators) =>
            onChange({ ...settings, nationalCoordinators })
          }
        />
      )}
    </>
  );
};
