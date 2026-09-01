import {
  Stage,
  StageLabels,
  StageList
} from 'maestro-shared/referential/Stage';
import type { ProgrammingSubPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { useEffect, useState } from 'react';
import { AppMultiSelect } from 'src/components/_app/AppMultiSelect/AppMultiSelect';
import { useForm } from 'src/hooks/useForm';
import { assert, type Equals } from 'tsafe';
import { z } from 'zod';

type Props = {
  subPlan: ProgrammingSubPlan;
};

const StagesForm = z.object({
  stages: Stage.array().min(1)
});

export const ProgrammingPlanGlobalSettings = ({ subPlan, ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [selectedStages, setSelectedStages] = useState<Stage[]>(subPlan.stages);

  useEffect(() => {
    setSelectedStages(subPlan.stages);
  }, [subPlan]);

  const form = useForm(StagesForm, { stages: selectedStages });

  return (
    <AppMultiSelect
      inputForm={form}
      inputKey={'stages'}
      items={StageList}
      values={selectedStages}
      onChange={(newStages) => setSelectedStages(newStages)}
      keysWithLabels={StageLabels}
      defaultLabel={'stade sélectionné'}
      label={'Stade(s) de prélèvement'}
      required
    />
  );
};
