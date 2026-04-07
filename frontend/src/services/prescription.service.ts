import type { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';
import config from 'src/utils/config';
import { getURLQuery } from 'src/utils/fetchUtils';

const prescriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findPrescriptions: buildTypedQuery(builder, '/prescriptions', {
      providesTags: (result) => [
        { type: 'Prescription', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'Prescription' as const,
          id
        }))
      ]
    }),
    addPrescription: buildTypedMutation(builder, '/prescriptions', 'post', {
      invalidatesTags: [
        { type: 'Prescription', id: 'LIST' },
        { type: 'LocalPrescription', id: 'LIST' }
      ]
    }),
    updatePrescription: buildTypedMutation(
      builder,
      '/prescriptions/:prescriptionId',
      'put',
      {
        invalidatesTags: (_result, _error, { prescriptionId }) => [
          { type: 'Prescription', id: 'LIST' },
          { type: 'Prescription', id: prescriptionId },
          { type: 'PrescriptionSubstance', id: prescriptionId }
        ]
      }
    ),
    deletePrescription: buildTypedMutation(
      builder,
      '/prescriptions/:prescriptionId',
      'delete',
      {
        invalidatesTags: [
          { type: 'Prescription', id: 'LIST' },
          { type: 'LocalPrescription', id: 'LIST' }
        ]
      }
    ),
    getPrescriptionSubstances: buildTypedQuery(
      builder,
      '/prescriptions/:prescriptionId/substances',
      {
        providesTags: (_result, _error, { prescriptionId }) => [
          { type: 'PrescriptionSubstance', id: prescriptionId }
        ]
      }
    )
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
