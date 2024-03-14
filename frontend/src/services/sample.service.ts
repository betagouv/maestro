import fp from 'lodash';
import { PartialSample, SampleToCreate } from 'shared/schema/Sample/Sample';
import { api } from 'src/services/api.service';

export const sampleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSample: builder.query<PartialSample, string>({
      query: (sampleId) => `samples/${sampleId}`,
      transformResponse: (response: any) =>
        PartialSample.parse(fp.omitBy(response, fp.isNil)),
      providesTags: (result, error, sampleId) =>
        result ? [{ type: 'Sample', id: sampleId }] : [],
    }),
    findSamples: builder.query<PartialSample[], void>({
      query: () => 'samples',
      transformResponse: (response: any[]) =>
        response.map((_) => PartialSample.parse(fp.omitBy(_, fp.isNil))),
      providesTags: (result) => [
        { type: 'Sample', id: 'LIST' },
        ...(result
          ? [...result.map(({ id }) => ({ type: 'Sample' as const, id }))]
          : []),
      ],
    }),
    createSample: builder.mutation<PartialSample, SampleToCreate>({
      query: (draft) => ({
        url: 'samples',
        method: 'POST',
        body: { ...draft },
      }),
      transformResponse: (response: any) =>
        PartialSample.parse(fp.omitBy(response, fp.isNil)),
      invalidatesTags: [{ type: 'Sample', id: 'LIST' }],
    }),
    updateSample: builder.mutation<PartialSample, PartialSample>({
      query: (partialSample) => ({
        url: `samples/${partialSample.id}`,
        method: 'PUT',
        body: partialSample,
      }),
      transformResponse: (response: any) =>
        PartialSample.parse(fp.omitBy(response, fp.isNil)),
      invalidatesTags: (result, error, { id }) =>
        result
          ? [
              { type: 'Sample', id: 'LIST' },
              { type: 'Sample', id },
            ]
          : [{ type: 'Sample', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreateSampleMutation,
  useFindSamplesQuery,
  useGetSampleQuery,
  useUpdateSampleMutation,
} = sampleApi;
