import fp from 'lodash';
import { FindPrescriptionOptions } from 'shared/schema/Prescription/FindPrescriptionOptions';
import {
  Prescription,
  PrescriptionToCreate,
  PrescriptionUpdate,
} from 'shared/schema/Prescription/Prescription';
import { api } from 'src/services/api.service';
import { authParams } from 'src/services/auth-headers';
import config from 'src/utils/config';
import { getURLQuery } from 'src/utils/fetchUtils';

export const prescriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findPrescriptions: builder.query<Prescription[], FindPrescriptionOptions>({
      query: ({ programmingPlanId, ...findOptions }) => ({
        url: `programming-plans/${programmingPlanId}/prescriptions`,
        params: findOptions,
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => Prescription.parse(fp.omitBy(_, fp.isNil))),
      providesTags: (result) => [
        { type: 'Prescription', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'Prescription' as const,
          id,
        })),
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

const prescriptionsExportURL = (findOptions: FindPrescriptionOptions) => {
  const { programmingPlanId, ...queryFindOptions } = findOptions;
  const params = getURLQuery({
    ...queryFindOptions,
    ...authParams(),
  });
  return `${config.apiEndpoint}/api/programming-plans/${programmingPlanId}/prescriptions/export${params}`;
};

export const {
  useFindPrescriptionsQuery,
  useLazyFindPrescriptionsQuery,
  useUpdatePrescriptionMutation,
  useAddPrescriptionsMutation,
  useDeletePrescriptionsMutation,
  getPrescriptionsExportURL,
} = {
  ...prescriptionApi,
  getPrescriptionsExportURL: prescriptionsExportURL,
};
