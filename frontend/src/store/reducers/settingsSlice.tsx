import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProgrammingPlanStatus } from 'shared/schema/ProgrammingPlan/ProgrammingPlanStatus';

type SettingsState = {
  programmingPlanStatus: ProgrammingPlanStatus;
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: { programmingPlanStatus: 'Validated' } as SettingsState,
  reducers: {
    changeProgrammingPlanStatus: (
      state,
      action: PayloadAction<{ programmingPlanStatus: ProgrammingPlanStatus }>
    ) => {
      state.programmingPlanStatus = action.payload.programmingPlanStatus;
    },
  },
});

export default settingsSlice;
