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
        invalidatesTags: (_result, _error, { prescriptionId }) => [
          { type: 'LocalPrescription', id: 'LIST' },
          { type: 'LocalPrescription', id: prescriptionId }
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
          { type: 'LocalPrescription', id: prescriptionId }
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
    )
  })
});

export const {
  useFindLocalPrescriptionsQuery,
  useGetLocalPrescriptionQuery,
  useGetLocalPrescriptionByCompanyQuery,
  useUpdateLocalPrescriptionMutation,
  useUpdateDepartmentalLocalPrescriptionMutation,
  useCommentLocalPrescriptionMutation
} = { ...prescriptionApi };
