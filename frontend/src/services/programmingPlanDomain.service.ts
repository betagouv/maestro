import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const programmingPlanDomainApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findProgrammingPlanDomains: buildTypedQuery(
      builder,
      '/programming-plan-domains',
      {
        providesTags: () => ['ProgrammingPlanDomain']
      }
    ),
    createProgrammingPlanDomain: buildTypedMutation(
      builder,
      '/programming-plan-domains',
      'post',
      {
        invalidatesTags: ['ProgrammingPlanDomain']
      }
    )
  })
});

export const {
  useFindProgrammingPlanDomainsQuery,
  useCreateProgrammingPlanDomainMutation
} = programmingPlanDomainApi;
