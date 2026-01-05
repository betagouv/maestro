import { isNil, omitBy } from 'lodash-es';
import { FindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlanLocalStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanLocalStatus';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { api } from 'src/services/api.service';

const programmingPlanApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findProgrammingPlans: builder.query<
      ProgrammingPlan[],
      FindProgrammingPlanOptions
    >({
      query: (options) => ({
        url: 'programming-plans',
        params: options
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => ProgrammingPlan.parse(omitBy(_, isNil))),
      providesTags: (result) => [
        { type: 'ProgrammingPlan', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'ProgrammingPlan' as const,
          id
        }))
      ]
    }),
    getProgrammingPlan: builder.query<ProgrammingPlan, string>({
      query: (programmingPlanId) => `programming-plans/${programmingPlanId}`,
      transformResponse: (response: any) =>
        ProgrammingPlan.parse(omitBy(response, isNil)),
      providesTags: (result) => [{ type: 'ProgrammingPlan', id: result?.id }]
    }),
    createProgrammingPlan: builder.mutation<ProgrammingPlan, number>({
      query: (year) => ({
        url: `programming-plans/years/${year}`,
        method: 'POST'
      }),
      transformResponse: (response: any) =>
        ProgrammingPlan.parse(omitBy(response, isNil)),
      invalidatesTags: (_result, _error) => [{ type: 'ProgrammingPlan' }]
    }),
    updateProgrammingPlanStatus: builder.mutation<
      ProgrammingPlan,
      {
        programmingPlanId: string;
        status: ProgrammingPlanStatus;
      }
    >({
      query: ({ programmingPlanId, status }) => ({
        url: `programming-plans/${programmingPlanId}`,
        method: 'PUT',
        body: { status }
      }),
      transformResponse: (response: any) =>
        ProgrammingPlan.parse(omitBy(response, isNil)),
      invalidatesTags: (_result, _error, { programmingPlanId }) => [
        { type: 'ProgrammingPlan', id: programmingPlanId },
        { type: 'ProgrammingPlan', id: 'LIST' }
      ]
    }),
    updateProgrammingPlanLocalStatus: builder.mutation<
      ProgrammingPlan,
      {
        programmingPlanId: string;
        programmingPlanLocalStatusList: ProgrammingPlanLocalStatus[];
      }
    >({
      query: ({ programmingPlanId, programmingPlanLocalStatusList }) => ({
        url: `programming-plans/${programmingPlanId}/local-status`,
        method: 'PUT',
        body: programmingPlanLocalStatusList
      }),
      transformResponse: (response: any) =>
        ProgrammingPlan.parse(omitBy(response, isNil)),
      invalidatesTags: (_result, _error, { programmingPlanId }) => [
        { type: 'ProgrammingPlan', id: programmingPlanId },
        { type: 'ProgrammingPlan', id: 'LIST' }
      ]
    })
  })
});

export const {
  useFindProgrammingPlansQuery,
  useGetProgrammingPlanQuery,
  useCreateProgrammingPlanMutation,
  useUpdateProgrammingPlanStatusMutation,
  useUpdateProgrammingPlanLocalStatusMutation
} = programmingPlanApi;
