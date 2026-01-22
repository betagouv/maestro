import {
  ProgrammingPlanSpecificDataAttribute,
  ProgrammingPlanSpecificDataAttributeValue,
  ProgrammingPlanSpecificDataRecord
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSpecificDataAttribute';
import { api } from 'src/services/api.service';

const programmingPlanSpecificDataApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProgrammingPlanSpecificData: builder.query<
      ProgrammingPlanSpecificDataRecord,
      void
    >({
      query: () => '/programming-plans/specific-data-attribute',
      providesTags: ['ProgrammingPlanSpecificData']
    }),
    updateProgrammingPlanSpecificDataAttribute: builder.mutation<
      void,
      ProgrammingPlanSpecificDataAttribute
    >({
      query: (body) => ({
        url: '/programming-plans/specific-data-attribute',
        method: 'POST',
        body
      }),
      invalidatesTags: ['ProgrammingPlanSpecificData']
    }),
    updateProgrammingPlanSpecificDataAttributeValue: builder.mutation<
      void,
      ProgrammingPlanSpecificDataAttributeValue
    >({
      query: (body) => ({
        url: '/programming-plans/specific-data-attribute/value',
        method: 'POST',
        body
      }),
      invalidatesTags: ['ProgrammingPlanSpecificData']
    })
  })
});

export const {
  useGetProgrammingPlanSpecificDataQuery,
  useUpdateProgrammingPlanSpecificDataAttributeMutation,
  useUpdateProgrammingPlanSpecificDataAttributeValueMutation
} = programmingPlanSpecificDataApi;
