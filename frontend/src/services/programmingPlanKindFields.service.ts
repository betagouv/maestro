import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const programmingPlanKindFieldsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findPlanKindFieldConfigs: buildTypedQuery(
      builder,
      '/programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields',
      {
        providesTags: ['SpecificDataField']
      }
    ),
    addPlanKindField: buildTypedMutation(
      builder,
      '/programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields',
      'post',
      {
        invalidatesTags: ['SpecificDataField']
      }
    ),
    updatePlanKindField: buildTypedMutation(
      builder,
      '/programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields/:planKindFieldId',
      'put',
      {
        invalidatesTags: ['SpecificDataField']
      }
    ),
    deletePlanKindField: buildTypedMutation(
      builder,
      '/programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields/:planKindFieldId',
      'delete',
      {
        invalidatesTags: ['SpecificDataField']
      }
    ),
    updatePlanKindFieldOptions: buildTypedMutation(
      builder,
      '/programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields/:planKindFieldId/options',
      'put',
      {
        invalidatesTags: ['SpecificDataField']
      }
    )
  })
});

export const {
  useFindPlanKindFieldConfigsQuery,
  useAddPlanKindFieldMutation,
  useUpdatePlanKindFieldMutation,
  useDeletePlanKindFieldMutation,
  useUpdatePlanKindFieldOptionsMutation
} = programmingPlanKindFieldsApi;
