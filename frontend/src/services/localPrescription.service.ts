import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const prescriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findLocalPrescriptions: buildTypedQuery(builder, '/prescriptions/regions', {
      providesTags: (result) => [
        { type: 'LocalPrescription', id: 'LIST' },
        ...(result ?? []).map(({ prescriptionId }) => ({
          type: 'LocalPrescription' as const,
          id: prescriptionId
        }))
      ]
    }),
    getLocalPrescription: buildTypedQuery(
      builder,
      '/prescriptions/:prescriptionId/regions/:region',
      {
        providesTags: (_result, _error, { prescriptionId }) => [
          { type: 'LocalPrescription', id: prescriptionId }
        ]
      }
    ),
    getLocalPrescriptionByCompany: buildTypedQuery(
      builder,
      '/prescriptions/:prescriptionId/regions/:region/departments/:department/companies/:companySiret',
      {
        providesTags: (_result, _error, { prescriptionId }) => [
          { type: 'LocalPrescription', id: prescriptionId }
        ]
      }
    ),
    updateLocalPrescription: buildTypedMutation(
      builder,
      '/prescriptions/:prescriptionId/regions/:region',
      'put',
      {
        // Also touches programming_plan_local_status.lastModifiedAt server-side
        // (touchLocalStatus), which feeds the display status shown in "Suivi des
        // plans" — without invalidating ProgrammingPlan too, that tab keeps
        // showing the pre-edit status until something else happens to refetch it.
        invalidatesTags: (_result, _error, { prescriptionId }) => [
          { type: 'LocalPrescription', id: 'LIST' },
          { type: 'LocalPrescription', id: prescriptionId },
          { type: 'ProgrammingPlan', id: 'LIST' }
        ]
      }
    ),
    updateDepartmentalLocalPrescription: buildTypedMutation(
      builder,
      '/prescriptions/:prescriptionId/regions/:region/departments/:department',
      'put',
      {
        invalidatesTags: (_result, _error, { prescriptionId }) => [
          { type: 'LocalPrescription', id: 'LIST' },
          { type: 'LocalPrescription', id: prescriptionId },
          { type: 'ProgrammingPlan', id: 'LIST' }
        ]
      }
    ),
    commentLocalPrescription: buildTypedMutation(
      builder,
      '/prescriptions/:prescriptionId/regions/:region/comments',
      'post',
      {
        invalidatesTags: (_result, _error, { prescriptionId }) => [
          { type: 'LocalPrescription', id: prescriptionId }
        ]
      }
    ),
    // Deliberately no invalidatesTags — this marks server-side state only.
    // The badges already rendered from the current useFindLocalPrescriptionsQuery
    // subscription must stay visible until the user actually leaves and comes
    // back (or reloads), not vanish mid-session the moment this fires on arrival.
    markLocalPrescriptionChangesViewed: buildTypedMutation(
      builder,
      '/prescriptions/regions/:region/changes-viewed',
      'put'
    )
  })
});

export const {
  useFindLocalPrescriptionsQuery,
  useGetLocalPrescriptionQuery,
  useGetLocalPrescriptionByCompanyQuery,
  useUpdateLocalPrescriptionMutation,
  useUpdateDepartmentalLocalPrescriptionMutation,
  useCommentLocalPrescriptionMutation,
  useMarkLocalPrescriptionChangesViewedMutation
} = { ...prescriptionApi };
