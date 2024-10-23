import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';

type SettingsState = {
  programmingPlan?: ProgrammingPlan;
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    programmingPlan: undefined,
  } as SettingsState,
  reducers: {
    changeProgrammingPlan: (
      state,
      action: PayloadAction<ProgrammingPlan | undefined>
    ) => {
      state.programmingPlan = action.payload;
    },
  },
});

export default settingsSlice;
