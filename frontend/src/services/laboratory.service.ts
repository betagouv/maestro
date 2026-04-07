import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';
import config from '../utils/config';

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
  `${config.apiEndpoint}/api/laboratories/${laboratoryId}/analytical-competences/export`;

export const {
  useGetLaboratoryQuery,
  useFindLaboratoriesQuery,
  useGetLaboratoryAnalyticalCompetencesQuery,
  useCreateLaboratoryAnalyticalCompetenceMutation,
  useUpdateLaboratoryAnalyticalCompetenceMutation,
  getLaboratoryAnalyticCompetencesExportURL
} = {
  ...laboratoryApi,
  getLaboratoryAnalyticCompetencesExportURL:
    laboratoryAnalyticCompetencesExportURL
};
