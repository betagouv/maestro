import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Context } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { PrescriptionListDisplay } from 'src/views/PrescriptionListView/PrescriptionListView';

type PrescriptionsState = {
  prescriptionListContext: Context;
  prescriptionListDisplay: PrescriptionListDisplay;
  matrixQuery?: string;
  prescriptionAnalysisEditId?: string;
  regionalPrescriptionComments?: RegionalPrescription;
};
const initialState: PrescriptionsState = {
  prescriptionListContext: 'Control',
  prescriptionListDisplay: 'cards'
};

const prescriptionsSlice = createSlice({
  name: 'prescriptions',
  initialState,
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
    setRegionalPrescriptionComments: (
      state,
      action: PayloadAction<RegionalPrescription | undefined>
    ) => {
      state.regionalPrescriptionComments = action.payload;
    },
    reset(): PrescriptionsState {
      return initialState;
    }
  }
});

export default prescriptionsSlice;
