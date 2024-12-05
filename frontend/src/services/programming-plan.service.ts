import fp from 'lodash';
import { FindProgrammingPlanOptions } from 'shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import {
  ProgrammingPlan,
  ProgrammingPlanStatusUpdate
} from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
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
    getProgrammingPlanByYear: builder.query<ProgrammingPlan, number>({
      query: (year) => `programming-plans/${year}`,
      transformResponse: (response: any) =>
        ProgrammingPlan.parse(fp.omitBy(response, fp.isNil)),
      providesTags: (result) => [{ type: 'ProgrammingPlan', id: result?.id }]
    }),
    createProgrammingPlan: builder.mutation<ProgrammingPlan, number>({
      query: (year) => ({
        url: `programming-plans/${year}`,
        method: 'POST'
      }),
      transformResponse: (response: any) =>
        ProgrammingPlan.parse(fp.omitBy(response, fp.isNil)),
      invalidatesTags: (_result, _error) => [{ type: 'ProgrammingPlan' }]
    }),
    updateProgrammingPlan: builder.mutation<
      ProgrammingPlan,
      {
        programmingPlanId: string;
        programmingPlanUpdate: ProgrammingPlanStatusUpdate;
      }
    >({
      query: ({ programmingPlanId, programmingPlanUpdate }) => ({
        url: `programming-plans/${programmingPlanId}`,
        method: 'PUT',
        body: programmingPlanUpdate
      }),
      transformResponse: (response: any) =>
        ProgrammingPlan.parse(fp.omitBy(response, fp.isNil)),
      invalidatesTags: (_result, _error, { programmingPlanId }) => [
        { type: 'ProgrammingPlan', id: programmingPlanId }
      ]
    })
  })
});

export const {
  useFindProgrammingPlansQuery,
  useGetProgrammingPlanByYearQuery,
  useCreateProgrammingPlanMutation,
  useUpdateProgrammingPlanMutation
} = programmingPlanApi;
