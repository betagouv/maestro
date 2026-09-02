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
    findProgrammingPlanSettings: buildTypedQuery(
      builder,
      '/programming-plans/:programmingPlanId/settings',
      {
        providesTags: (_result, _error, { programmingPlanId }) => [
          { type: 'ProgrammingPlanSettings', id: programmingPlanId }
        ]
      }
    ),
    updateProgrammingPlanSettings: buildTypedMutation(
      builder,
      '/programming-plans/:programmingPlanId/settings',
      'put',
      {
        invalidatesTags: (_result, _error, { programmingPlanId }) => [
          'ProgrammingPlanSettings',
          'SpecificDataField',
          { type: 'ProgrammingPlan', id: programmingPlanId },
          { type: 'ProgrammingPlan', id: 'LIST' }
        ]
      }
    ),
    findProgrammingSubPlanSettings: buildTypedQuery(
      builder,
      '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/settings',
      {
        providesTags: (_result, _error, { programmingSubPlanId }) => [
          { type: 'ProgrammingPlanSettings', id: programmingSubPlanId }
        ]
      }
    ),
    updateProgrammingSubPlanSettings: buildTypedMutation(
      builder,
      '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/settings',
      'put',
      {
        invalidatesTags: (
          _result,
          _error,
          { programmingPlanId, programmingSubPlanId }
        ) => [
          { type: 'ProgrammingPlanSettings', id: programmingSubPlanId },
          'SpecificDataField',
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
  useUpdateProgrammingPlanStatusMutation,
  useUpdateProgrammingPlanLocalStatusMutation,
  useFindProgrammingPlanSettingsQuery,
  useUpdateProgrammingPlanSettingsMutation,
  useFindProgrammingSubPlanSettingsQuery,
  useUpdateProgrammingSubPlanSettingsMutation
} = programmingPlanApi;
