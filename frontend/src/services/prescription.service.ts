import { isNil, omitBy } from 'lodash-es';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import {
  Prescription,
  PrescriptionToCreate,
  PrescriptionUpdate
} from 'maestro-shared/schema/Prescription/Prescription';
import { PrescriptionSubstance } from 'maestro-shared/schema/Prescription/PrescriptionSubstance';
import { api } from 'src/services/api.service';
import config from 'src/utils/config';
import { getURLQuery } from 'src/utils/fetchUtils';

const prescriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findPrescriptions: builder.query<Prescription[], FindPrescriptionOptions>({
      query: (findOptions) => ({
        url: `prescriptions`,
        params: findOptions
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => Prescription.parse(omitBy(_, isNil))),
      providesTags: (result) => [
        { type: 'Prescription', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'Prescription' as const,
          id
        }))
      ]
    }),
    addPrescription: builder.mutation<Prescription, PrescriptionToCreate>({
      query: (prescriptionToCreate) => ({
        url: 'prescriptions',
        method: 'POST',
        body: prescriptionToCreate
      }),
      invalidatesTags: [
        { type: 'Prescription', id: 'LIST' },
        { type: 'LocalPrescription', id: 'LIST' }
      ],
      transformResponse: (response: any) =>
        Prescription.parse(omitBy(response, isNil))
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
        body: prescriptionUpdate
      }),
      invalidatesTags: (_result, _error, { prescriptionId }) => [
        { type: 'Prescription', id: 'LIST' },
        { type: 'Prescription', id: prescriptionId },
        { type: 'PrescriptionSubstance', id: prescriptionId }
      ],
      transformResponse: (response) => Prescription.parse(response)
    }),
    deletePrescription: builder.mutation<void, string>({
      query: (prescriptionId) => ({
        url: `prescriptions/${prescriptionId}`,
        method: 'DELETE'
      }),
      invalidatesTags: [
        { type: 'Prescription', id: 'LIST' },
        { type: 'LocalPrescription', id: 'LIST' }
      ]
    }),
    getPrescriptionSubstances: builder.query<PrescriptionSubstance[], string>({
      query: (prescriptionId) => `prescriptions/${prescriptionId}/substances`,
      transformResponse: (response: any[]) =>
        response.map((_) => PrescriptionSubstance.parse(omitBy(_, isNil))),
      providesTags: (_result, _error, prescriptionId) => [
        { type: 'PrescriptionSubstance', id: prescriptionId }
      ]
    })
  })
});

const prescriptionsExportURL = (findOptions: FindPrescriptionOptions) => {
  const params = getURLQuery(findOptions);
  return `${config.apiEndpoint}/api/prescriptions/export${params}`;
};

export const {
  useFindPrescriptionsQuery,
  useLazyFindPrescriptionsQuery,
  useUpdatePrescriptionMutation,
  useAddPrescriptionMutation,
  useDeletePrescriptionMutation,
  getPrescriptionsExportURL,
  useGetPrescriptionSubstancesQuery,
  useLazyGetPrescriptionSubstancesQuery
} = {
  ...prescriptionApi,
  getPrescriptionsExportURL: prescriptionsExportURL
};
