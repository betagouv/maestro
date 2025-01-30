import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';

type ProgrammingPlanState = {
  programmingPlan?: ProgrammingPlan;
};

const programmingPlanSlice = createSlice({
  name: 'programmingPlan',
  initialState: {
    programmingPlan: undefined,
  } as ProgrammingPlanState,
  reducers: {
    setProgrammingPlan: (
      state,
      action: PayloadAction<ProgrammingPlan | undefined>
    ) => {
      state.programmingPlan = action.payload;
    },
  },
});

export default programmingPlanSlice;
