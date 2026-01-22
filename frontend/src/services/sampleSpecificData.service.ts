import {
  SampleSpecificDataAttribute,
  SampleSpecificDataAttributeValue,
  SampleSpecificDataRecord
} from 'maestro-shared/schema/Sample/SampleSpecificDataAttribute';
import { api } from 'src/services/api.service';

const sampleSpecificDataApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSampleSpecificData: builder.query<SampleSpecificDataRecord, void>({
      query: () => '/programming-plans/specific-data-attribute',
      providesTags: ['SampleSpecificData']
    }),
    updateSampleSpecificDataAttribute: builder.mutation<
      void,
      SampleSpecificDataAttribute
    >({
      query: (body) => ({
        url: '/programming-plans/specific-data-attribute',
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
        url: '/programming-plans/specific-data-attribute/value',
        method: 'POST',
        body
      }),
      invalidatesTags: ['SampleSpecificData']
    })
  })
});

export const {
  useGetSampleSpecificDataQuery,
  useUpdateSampleSpecificDataAttributeMutation,
  useUpdateSampleSpecificDataAttributeValueMutation
} = sampleSpecificDataApi;
