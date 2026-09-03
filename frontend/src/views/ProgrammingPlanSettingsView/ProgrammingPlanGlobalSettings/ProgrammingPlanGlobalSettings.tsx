import {
  Stage,
  StageLabels,
  StageList
} from 'maestro-shared/referential/Stage';
import type { ProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings.ts';
import { AppMultiSelect } from 'src/components/_app/AppMultiSelect/AppMultiSelect';
import { useForm } from 'src/hooks/useForm';
import { assert, type Equals } from 'tsafe';
import { z } from 'zod';
import { ProgrammingPlanSettingInheritance } from '../ProgrammingPlanSettingInheritance/ProgrammingPlanSettingInheritance';

type Props<T extends ProgrammingPlanSettings> = {
  settings: T;
  planSettings: ProgrammingPlanSettings | undefined;
  onChange: (settings: T) => void;
};

const StagesForm = z.object({
  stages: Stage.array().min(1)
});

const stagesLabel = 'Stade(s) de prélèvement';

export const ProgrammingPlanGlobalSettings = <
  T extends ProgrammingPlanSettings
>({
  settings,
  planSettings,
  onChange,
  ..._rest
}: Props<T>) => {
  assert<Equals<keyof typeof _rest, never>>();

  const form = useForm(StagesForm, { stages: settings.stages ?? [] });

  return (
    <ProgrammingPlanSettingInheritance
      settingKey="stages"
      label={stagesLabel}
      settings={settings}
      planSettings={planSettings}
      onChange={onChange}
    >
      {(disabled, label) => (
        <AppMultiSelect
          inputForm={form}
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
  );
};
