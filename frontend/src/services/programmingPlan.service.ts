import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const programmingPlanApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findProgrammingPlans: buildTypedQuery(builder, '/programming-plans', {
      providesTags: (result) => [
        { type: 'ProgrammingPlan', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'ProgrammingPlan' as const,
          id
        }))
      ]
    }),
    getProgrammingPlan: buildTypedQuery(
      builder,
      '/programming-plans/:programmingPlanId',
      {
        providesTags: (result) => [{ type: 'ProgrammingPlan', id: result?.id }]
      }
    ),
    createProgrammingPlan: buildTypedMutation(
      builder,
      '/programming-plans/years/:year',
      'post',
      {
        invalidatesTags: [{ type: 'ProgrammingPlan' }]
      }
    ),
    updateProgrammingPlanStatus: buildTypedMutation(
      builder,
      '/programming-plans/:programmingPlanId',
      'put',
      {
        invalidatesTags: (_result, _error, { programmingPlanId }) => [
          { type: 'ProgrammingPlan', id: programmingPlanId },
          { type: 'ProgrammingPlan', id: 'LIST' }
        ]
      }
    ),
    updateProgrammingPlanLocalStatus: buildTypedMutation(
      builder,
      '/programming-plans/:programmingPlanId/local-status',
      'put',
      {
        invalidatesTags: (_result, _error, { programmingPlanId }) => [
          { type: 'ProgrammingPlan', id: programmingPlanId },
          { type: 'ProgrammingPlan', id: 'LIST' }
        ]
      }
    )
  })
});

export const {
  useFindProgrammingPlansQuery,
  useGetProgrammingPlanQuery,
  useCreateProgrammingPlanMutation,
  useUpdateProgrammingPlanStatusMutation,
  useUpdateProgrammingPlanLocalStatusMutation
} = programmingPlanApi;
