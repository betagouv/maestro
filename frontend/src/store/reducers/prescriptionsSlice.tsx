import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region } from 'maestro-shared/referential/Region';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanDomain } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { RegionalPrescriptionComment } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import { PrescriptionListDisplay } from 'src/views/ProgrammingView/ProgrammingPrescriptionList/ProgrammingPrescriptionList';
import { z } from 'zod';

export const PrescriptionFilters = z.object({
  year: z.coerce.number().int().nullish(),
  domain: ProgrammingPlanDomain.nullish(),
  planIds: z.array(z.guid()),
  kinds: z.array(ProgrammingPlanKind).nullish(),
  contexts: z.array(ProgrammingPlanContext).nullish(),
  matrixKinds: z.array(MatrixKind).nullish()
});

export type PrescriptionFilters = z.infer<typeof PrescriptionFilters>;

const PrescriptionCommentsData = z.discriminatedUnion('viewBy', [
  z.object({
    viewBy: z.literal('MatrixKind'),
    prescriptionId: z.guid(),
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
  prescriptionFilters: PrescriptionFilters;
  prescriptionListDisplay: PrescriptionListDisplay;
  matrixQuery?: string;
  prescriptionAnalysisEdit?: Prescription;
  prescriptionCommentsData?: PrescriptionCommentsData;
};
const initialState: PrescriptionsState = {
  prescriptionFilters: {
    planIds: []
  },
  prescriptionListDisplay: 'cards'
};

const prescriptionsSlice = createSlice({
  name: 'prescriptions',
  initialState,
  reducers: {
    changePrescriptionFilters: (
      state,
      action: PayloadAction<PrescriptionFilters>
    ) => {
      state.prescriptionFilters = action.payload;
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
    setPrescriptionAnalysisEdit: (
      state,
      action: PayloadAction<Prescription | undefined>
    ) => {
      state.prescriptionAnalysisEdit = action.payload;
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
