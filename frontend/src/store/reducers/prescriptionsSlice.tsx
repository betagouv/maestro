import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region } from 'maestro-shared/referential/Region';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { RegionalPrescriptionComment } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import { PrescriptionListDisplay } from 'src/views/ProgrammingPlanView/ProgrammingPlanPrescriptionList/ProgrammingPlanPrescriptionList';
import { z } from 'zod';

const PrescriptionCommentsData = z.discriminatedUnion('viewBy', [
  z.object({
    viewBy: z.literal('MatrixKind'),
    prescriptionId: z.string().uuid(),
    matrixKind: MatrixKind,
    currentRegion: Region.nullish(),
    regionalComments: z.array(
      z.object({
        region: Region,
        comments: z
          .array(
            RegionalPrescriptionComment.pick({
              comment: true,
              createdAt: true,
              createdBy: true
            })
          )
          .min(1)
      })
    )
  }),
  z.object({
    viewBy: z.literal('Region'),
    region: Region,
    currentMatrixKind: MatrixKind.nullish(),
    matrixKindsComments: z.array(
      z.object({
        matrixKind: MatrixKind,
        comments: z
          .array(
            RegionalPrescriptionComment.pick({
              comment: true,
              createdAt: true,
              createdBy: true
            })
          )
          .min(1)
      })
    )
  })
]);

type PrescriptionCommentsData = z.infer<typeof PrescriptionCommentsData>;

type PrescriptionsState = {
  prescriptionListContext: ProgrammingPlanContext;
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
    changeListContext: (
      state,
      action: PayloadAction<ProgrammingPlanContext>
    ) => {
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
