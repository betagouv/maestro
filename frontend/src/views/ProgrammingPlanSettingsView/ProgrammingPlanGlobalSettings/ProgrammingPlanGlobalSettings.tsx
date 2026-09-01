import {
  Stage,
  StageLabels,
  StageList
} from 'maestro-shared/referential/Stage';
import type { ProgrammingSubPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { AppMultiSelect } from 'src/components/_app/AppMultiSelect/AppMultiSelect';
import { useForm } from 'src/hooks/useForm';
import { assert, type Equals } from 'tsafe';
import { z } from 'zod';

type Props = {
  subPlan: ProgrammingSubPlan;
  onChange: (subPlan: ProgrammingSubPlan) => void;
};

const StagesForm = z.object({
  stages: Stage.array().min(1)
});

export const ProgrammingPlanGlobalSettings = ({
  subPlan,
  onChange,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const form = useForm(StagesForm, { stages: subPlan.stages });

  return (
    <AppMultiSelect
      inputForm={form}
      inputKey={'stages'}
      items={StageList}
      values={subPlan.stages}
      onChange={(stages) => onChange({ ...subPlan, stages })}
      keysWithLabels={StageLabels}
      defaultLabel={'stade sélectionné'}
      label={'Stade(s) de prélèvement'}
      required
    />
  );
};
