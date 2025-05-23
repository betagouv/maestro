import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region } from 'maestro-shared/referential/Region';
import { Context } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { PrescriptionListDisplay } from 'src/views/ProgrammingPlanView/ProgrammingPlanPrescriptionList/ProgrammingPlanPrescriptionList';

type PrescriptionCommentsData = {
  matrixKind: MatrixKind;
  regionalPrescriptions: RegionalPrescription[];
  currentRegion?: Region;
};

type PrescriptionsState = {
  prescriptionListContext: Context;
  prescriptionListDisplay: PrescriptionListDisplay;
  matrixQuery?: string;
  prescriptionAnalysisEditId?: string;
  prescriptionCommentsData?: PrescriptionCommentsData;
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
    setPrescriptionCommentsData: (
      state,
      action: PayloadAction<PrescriptionCommentsData | undefined>
    ) => {
      state.prescriptionCommentsData = action.payload;
    },
    reset(): PrescriptionsState {
      return initialState;
    }
  }
});

export default prescriptionsSlice;
