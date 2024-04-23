import fp from 'lodash';
import {
  Prescription,
  PrescriptionToCreate,
  PrescriptionUpdate,
} from 'shared/schema/Prescription/Prescription';
import { api } from 'src/services/api.service';
import { withAuthParams } from 'src/services/auth-headers';
import config from 'src/utils/config';

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
    addPrescriptions: builder.mutation<
      Prescription[],
      { programmingPlanId: string; prescriptions: PrescriptionToCreate[] }
    >({
      query: ({ programmingPlanId, prescriptions }) => ({
        url: `programming-plans/${programmingPlanId}/prescriptions`,
        method: 'POST',
        body: prescriptions,
      }),
      invalidatesTags: [{ type: 'Prescription', id: 'LIST' }],
      transformResponse: (response: any[]) =>
        response.map((_) => Prescription.parse(fp.omitBy(_, fp.isNil))),
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
    deletePrescriptions: builder.mutation<
      void,
      { programmingPlanId: string; prescriptionIds: string[] }
    >({
      query: ({ programmingPlanId, prescriptionIds }) => ({
        url: `programming-plans/${programmingPlanId}/prescriptions`,
        method: 'DELETE',
        body: prescriptionIds,
      }),
      invalidatesTags: [{ type: 'Prescription', id: 'LIST' }],
    }),
  }),
});

const prescriptionsExportURL = (programmingPlanId: string) =>
  withAuthParams(
    `${config.apiEndpoint}/api/programming-plans/${programmingPlanId}/prescriptions/export`
  );

export const {
  useFindPrescriptionsQuery,
  useUpdatePrescriptionMutation,
  useAddPrescriptionsMutation,
  useDeletePrescriptionsMutation,
  getPrescriptionsExportURL,
} = {
  ...prescriptionApi,
  getPrescriptionsExportURL: prescriptionsExportURL,
};
