import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

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
    findPrescriptionCounts: buildTypedQuery(builder, '/prescriptions/counts', {
      providesTags: [{ type: 'Prescription', id: 'LIST' }]
    }),
    importPrescriptions: buildTypedMutation(
      builder,
      '/prescriptions/import',
      'post',
      {
        invalidatesTags: [
          { type: 'Prescription', id: 'LIST' },
          { type: 'LocalPrescription', id: 'LIST' },
          { type: 'ProgrammingPlan', id: 'LIST' }
        ]
      }
    ),
    addPrescription: buildTypedMutation(builder, '/prescriptions', 'post', {
      invalidatesTags: [
        { type: 'Prescription', id: 'LIST' },
        { type: 'LocalPrescription', id: 'LIST' },
        { type: 'ProgrammingPlan', id: 'LIST' }
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
          { type: 'PrescriptionSubstance', id: prescriptionId },
          { type: 'ProgrammingPlan', id: 'LIST' }
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
          { type: 'LocalPrescription', id: 'LIST' },
          { type: 'ProgrammingPlan', id: 'LIST' }
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

export const {
  useFindPrescriptionsQuery,
  useLazyFindPrescriptionsQuery,
  useFindPrescriptionCountsQuery,
  useImportPrescriptionsMutation,
  useUpdatePrescriptionMutation,
  useAddPrescriptionMutation,
  useDeletePrescriptionMutation,
  useGetPrescriptionSubstancesQuery,
  useLazyGetPrescriptionSubstancesQuery
} = prescriptionApi;
