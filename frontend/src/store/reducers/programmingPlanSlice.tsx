import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';

type ProgrammingPlanState = {
  programmingPlan?: ProgrammingPlanChecked;
};

const programmingPlanSlice = createSlice({
  name: 'programmingPlan',
  initialState: {
    programmingPlan: undefined
  } as ProgrammingPlanState,
  reducers: {
    setProgrammingPlan: (
      state,
      action: PayloadAction<ProgrammingPlanChecked | undefined>
    ) => {
      state.programmingPlan = action.payload;
    }
  }
});

export default programmingPlanSlice;
