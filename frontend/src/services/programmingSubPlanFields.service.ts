import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const programmingProgrammingSubPlanFieldsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findProgrammingSubPlanFieldConfigs: buildTypedQuery(
      builder,
      '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/specific-data-fields',
      {
        providesTags: ['SpecificDataField']
      }
    ),
    addProgrammingSubPlanField: buildTypedMutation(
      builder,
      '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/specific-data-fields',
      'post',
      {
        invalidatesTags: ['SpecificDataField']
      }
    ),
    updateProgrammingSubPlanField: buildTypedMutation(
      builder,
      '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/specific-data-fields/:programmingSubPlanFieldId',
      'put',
      {
        invalidatesTags: ['SpecificDataField']
      }
    ),
    deleteProgrammingSubPlanField: buildTypedMutation(
      builder,
      '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/specific-data-fields/:programmingSubPlanFieldId',
      'delete',
      {
        invalidatesTags: ['SpecificDataField']
      }
    ),
    updateProgrammingSubPlanFieldOptions: buildTypedMutation(
      builder,
      '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/specific-data-fields/:programmingSubPlanFieldId/options',
      'put',
      {
        invalidatesTags: ['SpecificDataField']
      }
    )
  })
});

export const {
  useFindProgrammingSubPlanFieldConfigsQuery,
  useAddProgrammingSubPlanFieldMutation,
  useUpdateProgrammingSubPlanFieldMutation,
  useDeleteProgrammingSubPlanFieldMutation,
  useUpdateProgrammingSubPlanFieldOptionsMutation
} = programmingProgrammingSubPlanFieldsApi;
