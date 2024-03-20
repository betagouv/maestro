import fp from 'lodash';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { api } from 'src/services/api.service';

export const programmingPlanApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProgrammingPlan: builder.query<ProgrammingPlan, string>({
      query: (programmingPlanId) => `programming-plans/${programmingPlanId}`,
      transformResponse: (response: any) =>
        ProgrammingPlan.parse(fp.omitBy(response, fp.isNil)),
      providesTags: (result, error, programmingPlanId) =>
        result ? [{ type: 'ProgrammingPlan', id: programmingPlanId }] : [],
    }),
    findProgrammingPlans: builder.query<ProgrammingPlan[], void>({
      query: () => 'programming-plans',
      transformResponse: (response: any[]) =>
        response.map((_) => ProgrammingPlan.parse(fp.omitBy(_, fp.isNil))),
      providesTags: (result) => [
        { type: 'ProgrammingPlan', id: 'LIST' },
        ...(result
          ? [
              ...result.map(({ id }) => ({
                type: 'ProgrammingPlan' as const,
                id,
              })),
            ]
          : []),
      ],
    }),
  }),
});

export const { useFindProgrammingPlansQuery, useGetProgrammingPlanQuery } =
  programmingPlanApi;
