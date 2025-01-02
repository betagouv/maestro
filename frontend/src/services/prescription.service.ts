import fp from 'lodash';
import { FindPrescriptionOptions } from 'shared/schema/Prescription/FindPrescriptionOptions';
import {
  Prescription,
  PrescriptionToCreate,
  PrescriptionUpdate
} from 'shared/schema/Prescription/Prescription';
import { PrescriptionSubstance } from 'shared/schema/Prescription/PrescriptionSubstance';
import { api } from 'src/services/api.service';
import { authParams } from 'src/services/auth-headers';
import config from 'src/utils/config';
import { getURLQuery } from 'src/utils/fetchUtils';

export const prescriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findPrescriptions: builder.query<Prescription[], FindPrescriptionOptions>({
      query: (findOptions) => ({
        url: `prescriptions`,
        params: findOptions
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => Prescription.parse(fp.omitBy(_, fp.isNil))),
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
        { type: 'RegionalPrescription', id: 'LIST' }
      ],
      transformResponse: (response: any) =>
        Prescription.parse(fp.omitBy(response, fp.isNil))
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
        { type: 'RegionalPrescription', id: 'LIST' }
      ]
    }),
    getPrescriptionSubstances: builder.query<PrescriptionSubstance[], string>({
      query: (prescriptionId) => `prescriptions/${prescriptionId}/substances`,
      transformResponse: (response: any[]) =>
        response.map((_) =>
          PrescriptionSubstance.parse(fp.omitBy(_, fp.isNil))
        ),
      providesTags: (_result, _error, prescriptionId) => [
        { type: 'PrescriptionSubstance', id: prescriptionId }
      ]
    })
  })
});

const prescriptionsExportURL = (findOptions: FindPrescriptionOptions) => {
  const params = getURLQuery({
    ...findOptions,
    ...authParams()
  });
  return `${config.apiEndpoint}/api/prescriptions/export${params}`;
};

export const {
  useFindPrescriptionsQuery,
  useLazyFindPrescriptionsQuery,
  useUpdatePrescriptionMutation,
  useAddPrescriptionMutation,
  useDeletePrescriptionMutation,
  getPrescriptionsExportURL,
  useGetPrescriptionSubstancesQuery
} = {
  ...prescriptionApi,
  getPrescriptionsExportURL: prescriptionsExportURL
};
