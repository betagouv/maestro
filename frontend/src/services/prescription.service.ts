import fp from 'lodash';
import { FindPrescriptionOptions } from 'shared/schema/Prescription/FindPrescriptionOptions';
import {
  Prescription,
  PrescriptionsToCreate,
  PrescriptionsToDelete,
  PrescriptionUpdate,
} from 'shared/schema/Prescription/Prescription';
import { api } from 'src/services/api.service';
import { authParams } from 'src/services/auth-headers';
import config from 'src/utils/config';
import { getURLQuery } from 'src/utils/fetchUtils';

export const prescriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findPrescriptions: builder.query<Prescription[], FindPrescriptionOptions>({
      query: (findOptions) => ({
        url: `prescriptions`,
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
    addPrescriptions: builder.mutation<Prescription[], PrescriptionsToCreate>({
      query: (prescriptionToCreate) => ({
        url: 'prescriptions',
        method: 'POST',
        body: prescriptionToCreate,
      }),
      invalidatesTags: [{ type: 'Prescription', id: 'LIST' }],
      transformResponse: (response: any[]) =>
        response.map((_) => Prescription.parse(fp.omitBy(_, fp.isNil))),
    }),
    updatePrescription: builder.mutation<
      Prescription,
      {
        prescriptionId: string;
        prescriptionUpdate: PrescriptionUpdate;
      }
    >({
      query: ({ prescriptionId, prescriptionUpdate }) => ({
        url: `prescriptions/${prescriptionId}`,
        method: 'PUT',
        body: prescriptionUpdate,
      }),
      invalidatesTags: (result, error, { prescriptionId }) => [
        { type: 'Prescription', id: 'LIST' },
        { type: 'Prescription', id: prescriptionId },
      ],
      transformResponse: (response) => Prescription.parse(response),
    }),
    deletePrescriptions: builder.mutation<void, PrescriptionsToDelete>({
      query: (prescriptionsToDelete) => ({
        url: 'prescriptions',
        method: 'DELETE',
        body: prescriptionsToDelete,
      }),
      invalidatesTags: [{ type: 'Prescription', id: 'LIST' }],
    }),
  }),
});

const prescriptionsExportURL = (findOptions: FindPrescriptionOptions) => {
  const params = getURLQuery({
    ...findOptions,
    ...authParams(),
  });
  return `${config.apiEndpoint}/api/prescriptions/export${params}`;
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
