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
    ),
    deleteProgrammingPlanDomain: buildTypedMutation(
      builder,
      '/programming-plan-domains/:programmingPlanDomainId',
      'delete',
      {
        invalidatesTags: () => [
          'ProgrammingPlanDomain',
          { type: 'ProgrammingPlan', id: 'LIST' }
        ]
      }
    )
  })
});

export const {
  useFindProgrammingPlanDomainsQuery,
  useCreateProgrammingPlanDomainMutation,
  useDeleteProgrammingPlanDomainMutation
} = programmingPlanDomainApi;
