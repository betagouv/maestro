import fp from 'lodash';
import {
  PartialSample,
  PartialSampleUpdate,
  SampleToCreate,
} from 'shared/schema/Sample';
import { api } from 'src/services/api.service';

export const sampleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createSample: builder.mutation<string, SampleToCreate>({
      query: (draft) => ({
        url: 'samples',
        method: 'POST',
        body: { ...draft },
      }),
      transformResponse: (response: any) => response.id,
      invalidatesTags: [{ type: 'Sample', id: 'LIST' }],
    }),
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
    updateSample: builder.mutation<
      void,
      { sampleId: string; sampleUpdate: PartialSampleUpdate }
    >({
      query: ({ sampleId, sampleUpdate }) => ({
        url: `samples/${sampleId}`,
        method: 'PUT',
        body: sampleUpdate,
      }),
      invalidatesTags: (result, error, { sampleId }) =>
        result
          ? [
              { type: 'Sample', id: 'LIST' },
              { type: 'Sample', id: sampleId },
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
