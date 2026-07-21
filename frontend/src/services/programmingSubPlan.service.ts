import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const programmingSubPlanApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findProgrammingSubPlans: buildTypedQuery(
      builder,
      '/programming-plans/:programmingPlanId/sub-plans',
      {
        providesTags: (result) => [
          { type: 'ProgrammingSubPlan', id: 'LIST' },
          ...(result ?? []).map(({ id }) => ({
            type: 'ProgrammingSubPlan' as const,
            id
          }))
        ]
      }
    ),
    updateProgrammingSubPlanStatus: buildTypedMutation(
      builder,
      '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId',
      'put',
      {
        invalidatesTags: (_result, _error, { programmingSubPlanId }) => [
          { type: 'ProgrammingSubPlan', id: programmingSubPlanId },
          { type: 'ProgrammingSubPlan', id: 'LIST' }
        ]
      }
    ),
    updateProgrammingSubPlanLocalStatus: buildTypedMutation(
      builder,
      '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/local-status',
      'put',
      {
        invalidatesTags: (_result, _error, { programmingSubPlanId }) => [
          { type: 'ProgrammingSubPlan', id: programmingSubPlanId },
          { type: 'ProgrammingSubPlan', id: 'LIST' }
        ]
      }
    )
  })
});

export const {
  useFindProgrammingSubPlansQuery,
  useUpdateProgrammingSubPlanStatusMutation,
  useUpdateProgrammingSubPlanLocalStatusMutation
} = programmingSubPlanApi;
