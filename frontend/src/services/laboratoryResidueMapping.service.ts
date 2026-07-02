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
    updateLaboratoryResidueMapping: buildTypedMutation(
      builder,
      '/laboratories/:laboratoryId/residue-mappings',
      'put',
      {
        invalidatesTags: (_result, _error, { laboratoryId }) => [
          { type: 'LaboratoryResidueMapping', id: laboratoryId }
        ]
      }
    )
  })
});

export const {
  useFindLaboratoryResidueMappingsQuery,
  useUpdateLaboratoryResidueMappingMutation
} = laboratoryResidueMappingApi;
