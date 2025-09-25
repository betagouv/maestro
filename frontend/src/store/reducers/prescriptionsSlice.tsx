import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region } from 'maestro-shared/referential/Region';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanDomain } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { RegionalPrescriptionComment } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import { PrescriptionListDisplay } from 'src/views/ProgrammingView/ProgrammingPrescriptionList/ProgrammingPrescriptionList';
import { z } from 'zod';

export const PrescriptionFilters = z.object({
  year: z.coerce.number().int(),
  domain: ProgrammingPlanDomain.nullish(),
  planIds: z.array(z.guid()).nullish(),
  kinds: z.array(ProgrammingPlanKind).nullish(),
  contexts: z.array(ProgrammingPlanContext).nullish(),
  matrixKinds: z.array(MatrixKind).nullish()
});

export type PrescriptionFilters = z.infer<typeof PrescriptionFilters>;

const PrescriptionCommentsData = z.discriminatedUnion('viewBy', [
  z.object({
    viewBy: z.literal('MatrixKind'),
    programmingPlan: ProgrammingPlan,
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
        programmingPlan: ProgrammingPlan,
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

const PrescriptionModalData = z.object({
  mode: z.enum(['analysis', 'details']),
  programmingPlan: ProgrammingPlan,
  prescription: Prescription
});

const RegionalPrescriptionModalData = z.discriminatedUnion('viewBy', [
  z.object({
    mode: z.literal('laboratory'),
    programmingPlan: ProgrammingPlan,
    prescription: Prescription,
    regionalPrescription: RegionalPrescription
  }),
  z.object({
    mode: z.literal('distribution'),
    programmingPlan: ProgrammingPlan,
    prescription: Prescription,
    regionalPrescription: RegionalPrescription,
    departmentalPrescriptions: z.array(RegionalPrescription)
  })
]);

type PrescriptionCommentsData = z.infer<typeof PrescriptionCommentsData>;
type PrescriptionModalData = z.infer<typeof PrescriptionModalData>;
type RegionalPrescriptionModalData = z.infer<
  typeof RegionalPrescriptionModalData
>;

type PrescriptionsState = {
  prescriptionFilters: PrescriptionFilters;
  prescriptionListDisplay: PrescriptionListDisplay;
  matrixQuery?: string;
  prescriptionModalData?: PrescriptionModalData;
  regionalPrescriptionModalData?: RegionalPrescriptionModalData;
  prescriptionCommentsData?: PrescriptionCommentsData;
};
const initialState: PrescriptionsState = {
  prescriptionFilters: {
    year: new Date().getFullYear(),
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
    setPrescriptionModalData: (
      state,
      action: PayloadAction<PrescriptionModalData | undefined>
    ) => {
      state.prescriptionModalData = action.payload;
    },
    setRegionalPrescriptionModalData: (
      state,
      action: PayloadAction<RegionalPrescriptionModalData | undefined>
    ) => {
      state.regionalPrescriptionModalData = action.payload;
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
