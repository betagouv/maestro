import {
  SampleSpecificDataAttribute,
  SampleSpecificDataAttributeValue
} from 'maestro-shared/schema/Sample/SampleSpecificDataAttribute';
import { api } from 'src/services/api.service';

const sampleSpecificDataApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateSampleSpecificDataAttribute: builder.mutation<
      void,
      SampleSpecificDataAttribute
    >({
      query: (body) => ({
        url: '/specific-data-attribute',
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
        url: '/specific-data-attribute/value',
        method: 'POST',
        body
      }),
      invalidatesTags: ['SampleSpecificData']
    })
  })
});

export const {
  useUpdateSampleSpecificDataAttributeMutation,
  useUpdateSampleSpecificDataAttributeValueMutation
} = sampleSpecificDataApi;
