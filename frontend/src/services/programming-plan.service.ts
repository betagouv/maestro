import fp from 'lodash';
import { FindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlanRegionalStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanRegionalStatus';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { api } from 'src/services/api.service';

export const programmingPlanApi = api.injectEndpoints({
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
        response.map((_) => ProgrammingPlan.parse(fp.omitBy(_, fp.isNil))),
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
        ProgrammingPlan.parse(fp.omitBy(response, fp.isNil)),
      providesTags: (result) => [{ type: 'ProgrammingPlan', id: result?.id }]
    }),
    getProgrammingPlanByYear: builder.query<ProgrammingPlan, number>({
      query: (year) => `programming-plans/years/${year}`,
      transformResponse: (response: any) =>
        ProgrammingPlan.parse(fp.omitBy(response, fp.isNil)),
      providesTags: (result) => [{ type: 'ProgrammingPlan', id: result?.id }]
    }),
    createProgrammingPlan: builder.mutation<ProgrammingPlan, number>({
      query: (year) => ({
        url: `programming-plans/years/${year}`,
        method: 'POST'
      }),
      transformResponse: (response: any) =>
        ProgrammingPlan.parse(fp.omitBy(response, fp.isNil)),
      invalidatesTags: (_result, _error) => [{ type: 'ProgrammingPlan' }]
    }),
    updateProgrammingPlanRegionalStatus: builder.mutation<
      ProgrammingPlan,
      {
        programmingPlanId: string;
        programmingPlanRegionalStatusList: ProgrammingPlanRegionalStatus[];
      }
    >({
      query: ({ programmingPlanId, programmingPlanRegionalStatusList }) => ({
        url: `programming-plans/${programmingPlanId}/regional-status`,
        method: 'PUT',
        body: programmingPlanRegionalStatusList
      }),
      transformResponse: (response: any) =>
        ProgrammingPlan.parse(fp.omitBy(response, fp.isNil))
    })
  })
});

export const {
  useFindProgrammingPlansQuery,
  useGetProgrammingPlanQuery,
  useGetProgrammingPlanByYearQuery,
  useCreateProgrammingPlanMutation,
  useUpdateProgrammingPlanRegionalStatusMutation
} = programmingPlanApi;
