import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Context } from 'shared/schema/ProgrammingPlan/Context';
import { PrescriptionListDisplay } from 'src/views/PrescriptionListView/PrescriptionListView';

type PrescriptionsState = {
  prescriptionListContext: Context;
  prescriptionListDisplay: PrescriptionListDisplay;
  matrixQuery?: string;
  prescriptionAnalysisEditId?: string;
};

const prescriptionsSlice = createSlice({
  name: 'prescriptions',
  initialState: {
    prescriptionListContext: 'Control',
    prescriptionListDisplay: 'cards',
  } as PrescriptionsState,
  reducers: {
    changeListContext: (state, action: PayloadAction<Context>) => {
      state.prescriptionListContext = action.payload;
    },
    changeListDisplay: (
      state,
      action: PayloadAction<PrescriptionListDisplay>
    ) => {
      state.prescriptionListDisplay = action.payload;
    },
    changeMatrixQuery: (state, action: PayloadAction<string>) => {
      state.matrixQuery = action.payload;
    },
    setPrescriptionAnalysisEditId: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.prescriptionAnalysisEditId = action.payload;
    },
  },
});

export default prescriptionsSlice;
