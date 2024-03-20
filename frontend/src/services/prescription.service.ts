import fp from 'lodash';
import {
  Prescription,
  PrescriptionUpdate,
} from 'shared/schema/Prescription/Prescription';
import { api } from 'src/services/api.service';

export const prescriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findPrescriptions: builder.query<
      Prescription[],
      { programmingPlanId: string }
    >({
      query: ({ programmingPlanId }) =>
        `programming-plans/${programmingPlanId}/prescriptions`,
      transformResponse: (response: any[]) =>
        response.map((_) => Prescription.parse(fp.omitBy(_, fp.isNil))),
      providesTags: (result) => [
        { type: 'Prescription', id: 'LIST' },
        ...(result
          ? [
              ...result.map(({ id }) => ({
                type: 'Prescription' as const,
                id,
              })),
            ]
          : []),
      ],
    }),
    updatePrescription: builder.mutation<
      Prescription,
      {
        programmingPlanId: string;
        prescriptionId: string;
        prescriptionUpdate: PrescriptionUpdate;
      }
    >({
      query: ({ programmingPlanId, prescriptionId, prescriptionUpdate }) => ({
        url: `programming-plans/${programmingPlanId}/prescriptions/${prescriptionId}`,
        method: 'PUT',
        body: prescriptionUpdate,
      }),
      invalidatesTags: (result, error, { prescriptionId }) => [
        { type: 'Prescription', id: 'LIST' },
        { type: 'Prescription', id: prescriptionId },
      ],
      transformResponse: (response) => Prescription.parse(response),
    }),
  }),
});

export const { useFindPrescriptionsQuery, useUpdatePrescriptionMutation } =
  prescriptionApi;
