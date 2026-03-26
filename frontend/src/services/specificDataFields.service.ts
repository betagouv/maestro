import type {
  SampleSpecificDataAttribute,
  SampleSpecificDataAttributeValue
} from 'maestro-shared/schema/Sample/SampleSpecificDataAttribute';
import type { SachaFieldConfig } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { api } from 'src/services/api.service';

const specificDataFieldsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findSachaFieldConfigs: builder.query<SachaFieldConfig[], void>({
      query: () => `/specific-data-fields/sacha`,
      providesTags: ['SampleSpecificData']
    }),
    updateSampleSpecificDataAttribute: builder.mutation<
      void,
      SampleSpecificDataAttribute
    >({
      query: (body) => ({
        url: '/specific-data-fields/attribute',
        method: 'POST',
        body
      }),
      invalidatesTags: ['SampleSpecificData']
    }),
    updateSampleSpecificDataAttributeValue: builder.mutation<
      void,
      SampleSpecificDataAttributeValue
    >({
      query: (body) => ({
        url: '/specific-data-fields/attribute/value',
        method: 'POST',
        body
      }),
      invalidatesTags: ['SampleSpecificData']
    })
  })
});

export const {
  useFindSachaFieldConfigsQuery,
  useUpdateSampleSpecificDataAttributeMutation,
  useUpdateSampleSpecificDataAttributeValueMutation
} = specificDataFieldsApi;
