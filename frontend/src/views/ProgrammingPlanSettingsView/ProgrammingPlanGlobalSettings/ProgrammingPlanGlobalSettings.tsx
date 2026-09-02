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

type Props<T extends ProgrammingPlanSettings> = {
  subPlan: T;
  onChange: (subPlan: T) => void;
};

const StagesForm = z.object({
  stages: Stage.array().min(1)
});

export const ProgrammingPlanGlobalSettings = <
  T extends ProgrammingPlanSettings
>({
  subPlan,
  onChange,
  ..._rest
}: Props<T>) => {
  assert<Equals<keyof typeof _rest, never>>();

  const form = useForm(StagesForm, { stages: subPlan.stages ?? [] });

  return (
    <AppMultiSelect
      inputForm={form}
      inputKey={'stages'}
      items={StageList}
      values={subPlan.stages ?? []}
      onChange={(stages) => onChange({ ...subPlan, stages })}
      keysWithLabels={StageLabels}
      defaultLabel={'stade sélectionné'}
      label={'Stade(s) de prélèvement'}
      required
    />
  );
};
