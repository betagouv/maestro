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
    createProgrammingPlanCampaign: buildTypedMutation(
      builder,
      '/programming-plan-domains/campaigns',
      'post',
      {
        invalidatesTags: () => [
          'ProgrammingPlanDomain',
          { type: 'ProgrammingPlan', id: 'LIST' }
        ]
      }
    ),
    duplicateProgrammingPlanDomain: buildTypedMutation(
      builder,
      '/programming-plan-domains/:programmingPlanDomainId/duplicate',
      'post',
      {
        invalidatesTags: () => [
          'ProgrammingPlanDomain',
          { type: 'ProgrammingPlan', id: 'LIST' }
        ]
      }
    ),
    updateProgrammingPlanDomain: buildTypedMutation(
      builder,
      '/programming-plan-domains/:programmingPlanDomainId',
      'put',
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
  useCreateProgrammingPlanCampaignMutation,
  useUpdateProgrammingPlanDomainMutation,
  useDeleteProgrammingPlanDomainMutation,
  useDuplicateProgrammingPlanDomainMutation
} = programmingPlanDomainApi;
