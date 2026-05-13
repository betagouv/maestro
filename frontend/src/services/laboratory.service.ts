import type { FindLaboratoryAgreementsOptions } from 'maestro-shared/schema/Laboratory/FindLaboratoryAgreementsOptions';
import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';
import config from '../utils/config';
import { getApiUrl, getURLQuery } from '../utils/fetchUtils';

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
    updateLaboratoryAgreements: buildTypedMutation(
      builder,
      '/laboratories/:laboratoryId/agreements',
      'put',
      {
        invalidatesTags: [{ type: 'LaboratoryAgreement', id: 'LIST' }]
      }
    ),
    getLaboratoryAnalyticalCompetences: buildTypedQuery(
      builder,
      '/laboratories/:laboratoryId/analytical-competences',
      {
        providesTags: (_result, _error, { laboratoryId }) => [
          { type: 'LaboratoryAnalyticalCompetence', id: laboratoryId }
        ]
      }
    ),
    createLaboratoryAnalyticalCompetence: buildTypedMutation(
      builder,
      '/laboratories/:laboratoryId/analytical-competences',
      'post',
      {
        invalidatesTags: (_result, _error, { laboratoryId }) => [
          { type: 'LaboratoryAnalyticalCompetence', id: laboratoryId }
        ]
      }
    ),
    updateLaboratoryAnalyticalCompetence: buildTypedMutation(
      builder,
      '/laboratories/:laboratoryId/analytical-competences/:analyticalCompetenceId',
      'put',
      {
        invalidatesTags: (_result, _error, { laboratoryId }) => [
          { type: 'LaboratoryAnalyticalCompetence', id: laboratoryId }
        ]
      }
    )
  })
});

const laboratoryAnalyticCompetencesExportURL = (laboratoryId: string) =>
  getApiUrl('/laboratories/:laboratoryId/analytical-competences/export', {
    laboratoryId
  });

const laboratoryAgreementsExportURL = (
  opts?: FindLaboratoryAgreementsOptions
) => {
  const params = opts ? getURLQuery(opts) : '';
  return `${config.apiEndpoint}/api/laboratories/agreements/export${params}`;
};

export const {
  useGetLaboratoryQuery,
  useFindLaboratoriesQuery,
  useGetLaboratoryConfigQuery,
  useUpdateLaboratoryConfigMutation,
  useFindLaboratoryAgreementsQuery,
  useUpdateLaboratoryAgreementsMutation,
  useGetLaboratoryAnalyticalCompetencesQuery,
  useCreateLaboratoryAnalyticalCompetenceMutation,
  useUpdateLaboratoryAnalyticalCompetenceMutation,
  getLaboratoryAnalyticCompetencesExportURL,
  getLaboratoryAgreementsExportURL
} = {
  ...laboratoryApi,
  getLaboratoryAnalyticCompetencesExportURL:
    laboratoryAnalyticCompetencesExportURL,
  getLaboratoryAgreementsExportURL: laboratoryAgreementsExportURL
};
