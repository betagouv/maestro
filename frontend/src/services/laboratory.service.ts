import type { FindLaboratoryAgreementsOptions } from 'maestro-shared/schema/Laboratory/FindLaboratoryAgreementsOptions';
import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';
import { getApiUrl } from '../utils/fetchUtils';

const laboratoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLaboratory: buildTypedQuery(builder, '/laboratories/:laboratoryId', {
      providesTags: (_result, _error, { laboratoryId }) => [
        { type: 'Laboratory', id: laboratoryId }
      ]
    }),
    findLaboratories: buildTypedQuery(builder, '/laboratories', {
      providesTags: (result) => [
        { type: 'Laboratory', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'Laboratory' as const,
          id
        }))
      ]
    }),
    getLaboratoryConfig: buildTypedQuery(
      builder,
      '/laboratories/:laboratoryId/config',
      {
        providesTags: (_result, _error, { laboratoryId }) => [
          { type: 'Laboratory', id: `config-${laboratoryId}` }
        ]
      }
    ),
    updateLaboratoryConfig: buildTypedMutation(
      builder,
      '/laboratories/:laboratoryId/config',
      'put',
      {
        invalidatesTags: (_result, _error, { laboratoryId }) => [
          { type: 'Laboratory', id: `config-${laboratoryId}` },
          { type: 'Laboratory', id: laboratoryId },
          { type: 'Laboratory', id: 'LIST' }
        ]
      }
    ),
    findLaboratoryAgreements: buildTypedQuery(
      builder,
      '/laboratories/agreements',
      {
        providesTags: [{ type: 'LaboratoryAgreement', id: 'LIST' }]
      }
    ),
    findLaboratoryAgreementChecks: buildTypedQuery(
      builder,
      '/laboratories/agreements/checks',
      {
        providesTags: [{ type: 'LaboratoryAgreementCheck', id: 'LIST' }]
      }
    ),
    updateLaboratoryAgreementCheck: buildTypedMutation(
      builder,
      '/laboratories/agreements/checks',
      'put',
      {
        invalidatesTags: [{ type: 'LaboratoryAgreementCheck', id: 'LIST' }]
      }
    ),
    updateLaboratoryAgreements: buildTypedMutation(
      builder,
      '/laboratories/:laboratoryId/agreements',
      'put',
      {
        invalidatesTags: [{ type: 'LaboratoryAgreement', id: 'LIST' }]
      }
    )
  })
});

export const getLaboratoryAgreementsExportURL = (
  opts?: FindLaboratoryAgreementsOptions
) => getApiUrl('/laboratories/agreements/export', opts ?? {});

export const {
  useGetLaboratoryQuery,
  useFindLaboratoriesQuery,
  useGetLaboratoryConfigQuery,
  useUpdateLaboratoryConfigMutation,
  useFindLaboratoryAgreementsQuery,
  useFindLaboratoryAgreementChecksQuery,
  useUpdateLaboratoryAgreementCheckMutation,
  useUpdateLaboratoryAgreementsMutation
} = laboratoryApi;
