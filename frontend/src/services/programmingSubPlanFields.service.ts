import { buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const programmingProgrammingSubPlanFieldsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findProgrammingSubPlanFieldConfigs: buildTypedQuery(
      builder,
      '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/specific-data-fields',
      {
        providesTags: ['SpecificDataField']
      }
    )
  })
});

export const { useFindProgrammingSubPlanFieldConfigsQuery } =
  programmingProgrammingSubPlanFieldsApi;
