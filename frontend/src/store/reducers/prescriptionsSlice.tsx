import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { Department } from 'maestro-shared/referential/Department';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { Region } from 'maestro-shared/referential/Region';
import { Stage } from 'maestro-shared/referential/Stage';
import { LocalPrescriptionComment } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionComment';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { PrescriptionComments } from 'maestro-shared/schema/Prescription/PrescriptionComments';
import { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanDomainId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { z } from 'zod';

export const PrescriptionFilters = z.object({
  year: z.coerce.number().int().nullish(),
  stage: Stage.nullish(),
  programmingPlanIds: z.array(z.guid()).nullish(),
  programmingSubPlanIds: z.array(ProgrammingSubPlanId).nullish(),
  programmingPlanDomainIds: z.array(ProgrammingPlanDomainId).nullish(),
  matrixKinds: z.array(MatrixKind).nullish(),
  contexts: z.array(ProgrammingPlanContext).nullish(),
  coordinatorIds: z.array(z.guid()).nullish(),
  laboratoryIds: z.array(z.guid()).nullish(),
  missingDistribution: z.boolean().nullish(),
  missingLaboratory: z.boolean().nullish(),
  withNovelty: z.boolean().nullish()
});

export type PrescriptionFilters = z.infer<typeof PrescriptionFilters>;

const PrescriptionCommentsData = z.discriminatedUnion('viewBy', [
  z.object({
    viewBy: z.literal('Prescription'),
    programmingPlan: ProgrammingPlanChecked,
    prescription: Prescription,
    currentRegion: Region.nullish(),
    regionalCommentsList: z.array(
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
    currentPrescription: Prescription.nullish(),
    prescriptionCommentsList: z.array(PrescriptionComments)
  })
]);

const PrescriptionModalData = z.object({
  mode: z.enum(['analysis', 'details']),
  programmingPlan: ProgrammingPlanChecked,
  prescription: Prescription
});

type PrescriptionCommentsData = z.infer<typeof PrescriptionCommentsData>;
type PrescriptionModalData = z.infer<typeof PrescriptionModalData>;

type PrescriptionsState = {
  prescriptionFilters: PrescriptionFilters;
  prescriptionModalData?: PrescriptionModalData;
  prescriptionCommentsData?: PrescriptionCommentsData;
};

const initialState: PrescriptionsState = {
  prescriptionFilters: {
    missingDistribution: false,
    missingLaboratory: false,
    withNovelty: false
  }
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
    setPrescriptionModalData: (
      state,
      action: PayloadAction<PrescriptionModalData | undefined>
    ) => {
      state.prescriptionModalData = action.payload;
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
