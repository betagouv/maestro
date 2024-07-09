import fp from 'lodash';
import { FindSampleOptions } from 'shared/schema/Sample/FindSampleOptions';
import { PartialSample, SampleToCreate } from 'shared/schema/Sample/Sample';
import { api } from 'src/services/api.service';
import { authParams } from 'src/services/auth-headers';
import config from 'src/utils/config';
import { getURLQuery } from 'src/utils/fetchUtils';

export const sampleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSample: builder.query<PartialSample, string>({
      query: (sampleId) => `samples/${sampleId}`,
      transformResponse: (response: any) =>
        PartialSample.parse(fp.omitBy(response, fp.isNil)),
      providesTags: (_result, _error, sampleId) => [
        { type: 'Sample', id: sampleId },
      ],
    }),
    findSamples: builder.query<PartialSample[], FindSampleOptions>({
      query: (findOptions) => ({
        url: 'samples',
        params: findOptions,
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => PartialSample.parse(fp.omitBy(_, fp.isNil))),
      providesTags: (result) => [
        { type: 'Sample', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({ type: 'Sample' as const, id })),
      ],
    }),
    countSamples: builder.query<number, FindSampleOptions>({
      query: (findOptions) => ({
        url: 'samples/count',
        params: findOptions,
      }),
      transformResponse: (response: { count: number }) =>
        Number(response.count),
      providesTags: ['SampleCount'],
    }),
    createSample: builder.mutation<PartialSample, SampleToCreate>({
      query: (draft) => ({
        url: 'samples',
        method: 'POST',
        body: { ...draft },
      }),
      transformResponse: (response: any) =>
        PartialSample.parse(fp.omitBy(response, fp.isNil)),
      invalidatesTags: [{ type: 'Sample', id: 'LIST' }, 'SampleCount'],
    }),
    updateSample: builder.mutation<PartialSample, PartialSample>({
      query: (partialSample) => ({
        url: `samples/${partialSample.id}`,
        method: 'PUT',
        body: partialSample,
      }),
      transformResponse: (response: any) =>
        PartialSample.parse(fp.omitBy(response, fp.isNil)),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Sample', id: 'LIST' },
        { type: 'Sample', id },
        'SampleCount',
      ],
    }),
    updateSampleItems: builder.mutation<void, { id: string; items: any[] }>({
      query: ({ id, items }) => ({
        url: `samples/${id}/items`,
        method: 'PUT',
        body: items,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Sample', id }],
    }),
    deleteSample: builder.mutation<void, string>({
      query: (id) => ({
        url: `samples/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Sample', id: 'LIST' },
        { type: 'Sample', id },
        'SampleCount',
      ],
    }),
  }),
});

const supportDocumentURL = (sampleId: string, itemNumber: number) => {
  const params = getURLQuery(authParams());
  return `${config.apiEndpoint}/api/samples/${sampleId}/items/${itemNumber}/document${params}`;
};

const sampleListExportURL = (findOptions: FindSampleOptions) => {
  const params = getURLQuery({
    ...findOptions,
    ...authParams(),
  });
  return `${config.apiEndpoint}/api/samples/export${params}`;
};

export const {
  useCreateSampleMutation,
  useFindSamplesQuery,
  useCountSamplesQuery,
  useGetSampleQuery,
  useUpdateSampleMutation,
  useUpdateSampleItemsMutation,
  useDeleteSampleMutation,
  getSupportDocumentURL,
  getSampleListExportURL,
} = {
  ...sampleApi,
  getSupportDocumentURL: supportDocumentURL,
  getSampleListExportURL: sampleListExportURL,
};
