import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const laboratoryResidueMappingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findLaboratoryResidueMappings: buildTypedQuery(
      builder,
      '/laboratories/:laboratoryId/residue-mappings',
      {
        providesTags: (_result, _error, { laboratoryId }) => [
          { type: 'LaboratoryResidueMapping', id: laboratoryId }
        ]
      }
    ),
    findLaboratoryOrphanResidueLabels: buildTypedQuery(
      builder,
      '/laboratories/:laboratoryId/residue-mappings/orphan-labels',
      {
        providesTags: (_result, _error, { laboratoryId }) => [
          { type: 'LaboratoryResidueMapping', id: `orphans-${laboratoryId}` }
        ]
      }
    ),
    updateLaboratoryResidueMapping: buildTypedMutation(
      builder,
      '/laboratories/:laboratoryId/residue-mappings',
      'put',
      {
        invalidatesTags: (_result, _error, { laboratoryId }) => [
          { type: 'LaboratoryResidueMapping', id: laboratoryId },
          { type: 'LaboratoryResidueMapping', id: `orphans-${laboratoryId}` }
        ]
      }
    )
  })
});

export const {
  useFindLaboratoryResidueMappingsQuery,
  useFindLaboratoryOrphanResidueLabelsQuery,
  useUpdateLaboratoryResidueMappingMutation
} = laboratoryResidueMappingApi;
