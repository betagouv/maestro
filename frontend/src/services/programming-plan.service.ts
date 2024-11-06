import fp from 'lodash';
import { FindProgrammingPlanOptions } from 'shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { api } from 'src/services/api.service';

export const programmingPlanApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findProgrammingPlans: builder.query<
      ProgrammingPlan[],
      FindProgrammingPlanOptions
    >({
      query: (options) => ({
        url: 'programming-plans',
        params: options,
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => ProgrammingPlan.parse(fp.omitBy(_, fp.isNil))),
      providesTags: (result) => [
        { type: 'ProgrammingPlan', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'ProgrammingPlan' as const,
          id,
        })),
      ],
    }),
  }),
});

export const { useFindProgrammingPlansQuery } = programmingPlanApi;
