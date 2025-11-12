import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Department } from 'maestro-shared/referential/Department';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region } from 'maestro-shared/referential/Region';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { LocalPrescriptionComment } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionComment';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanDomain } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { PrescriptionListDisplay } from 'src/views/ProgrammingView/ProgrammingPrescriptionList/ProgrammingPrescriptionList';
import { z } from 'zod';

export const PrescriptionFilters = z.object({
  year: z.coerce.number().int().nullish(),
  domain: ProgrammingPlanDomain.nullish(),
  programmingPlanId: z.guid().nullish(),
  kinds: z.array(ProgrammingPlanKind).nullish(),
  context: ProgrammingPlanContext.nullish(),
  matrixQuery: z.string().nullish(),
  missingSlaughterhouse: z.boolean().nullish(),
  missingLaboratory: z.boolean().nullish()
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
        department: Department.nullish(),
        comments: z
          .array(
            LocalPrescriptionComment.pick({
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
            LocalPrescriptionComment.pick({
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

const LocalPrescriptionModalData = z.discriminatedUnion('viewBy', [
  z.object({
    mode: z.literal('laboratory'),
    programmingPlan: ProgrammingPlan,
    prescription: Prescription,
    localPrescription: LocalPrescription
  }),
  z.object({
    mode: z.enum([
      'distributionToDepartments',
      'distributionToSlaughterhouses'
    ]),
    programmingPlan: ProgrammingPlan,
    prescription: Prescription,
    localPrescription: LocalPrescription,
    subLocalPrescriptions: z.array(LocalPrescription)
  })
]);

type PrescriptionCommentsData = z.infer<typeof PrescriptionCommentsData>;
type PrescriptionModalData = z.infer<typeof PrescriptionModalData>;
type LocalPrescriptionModalData = z.infer<typeof LocalPrescriptionModalData>;

type PrescriptionsState = {
  prescriptionFilters: PrescriptionFilters;
  prescriptionListDisplay: PrescriptionListDisplay;
  prescriptionModalData?: PrescriptionModalData;
  localPrescriptionModalData?: LocalPrescriptionModalData;
  prescriptionCommentsData?: PrescriptionCommentsData;
};
const initialState: PrescriptionsState = {
  prescriptionFilters: {
    missingSlaughterhouse: false,
    missingLaboratory: false
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
    setPrescriptionModalData: (
      state,
      action: PayloadAction<PrescriptionModalData | undefined>
    ) => {
      state.prescriptionModalData = action.payload;
    },
    setLocalPrescriptionModalData: (
      state,
      action: PayloadAction<LocalPrescriptionModalData | undefined>
    ) => {
      state.localPrescriptionModalData = action.payload;
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
