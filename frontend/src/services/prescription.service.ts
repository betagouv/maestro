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
    // These three also touch programming_plan_local_status.lastModifiedAt
    // server-side (touchLocalStatus), which feeds the display status shown in
    // "Suivi des plans" — ProgrammingPlan must be invalidated too, otherwise
    // that tab keeps showing the pre-edit status until something else refetches it.
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
  useUpdatePrescriptionMutation,
  useAddPrescriptionMutation,
  useDeletePrescriptionMutation,
  useGetPrescriptionSubstancesQuery,
  useLazyGetPrescriptionSubstancesQuery
} = prescriptionApi;
