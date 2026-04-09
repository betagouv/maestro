import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { isNil, omitBy } from 'lodash-es';
import {
  isCreatedPartialSample,
  PartialSample,
  type PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';
import samplesSlice from 'src/store/reducers/samplesSlice';
import { store } from 'src/store/store';
import config from 'src/utils/config';
import { getURLQuery } from 'src/utils/fetchUtils';

const sampleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSample: buildTypedQuery(builder, '/samples/:sampleId', {
      providesTags: (_result, _error, { sampleId }) => [
        { type: 'Sample', id: sampleId }
      ]
    }),
    findSamples: buildTypedQuery(builder, '/samples', {
      providesTags: (result) => [
        { type: 'Sample', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({ type: 'Sample' as const, id }))
      ]
    }),
    countSamples: buildTypedQuery(builder, '/samples/count', {
      providesTags: ['SampleCount']
    }),
    // biome-ignore lint: too complicated
    createOrUpdateSample: builder.mutation<
      PartialSample | PartialSampleToCreate,
      PartialSample | PartialSampleToCreate
    >({
      queryFn: async (partialSample, _queryApi, _extraOptions, fetchWithBQ) => {
        const result = await fetchWithBQ({
          url: isCreatedPartialSample(partialSample)
            ? `samples/${partialSample.id}`
            : 'samples',
          method: isCreatedPartialSample(partialSample) ? 'PUT' : 'POST',
          body: partialSample
        });

        if (result.error) {
          if (!navigator.onLine) {
            store.dispatch(
              samplesSlice.actions.addPendingSample(partialSample)
            );
            return { data: partialSample };
          }
          return { error: result.error as FetchBaseQueryError };
        }

        store.dispatch(
          samplesSlice.actions.removePendingSample(partialSample.id)
        );

        return {
          data: PartialSample.parse(omitBy(result.data as any, isNil))
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Sample', id: 'LIST' },
        { type: 'Sample', id },
        'SampleCount',
        { type: 'LocalPrescription', id: 'LIST' },
        { type: 'Prescription', id: 'LIST' }
      ]
    }),
    updateSample: buildTypedMutation(builder, '/samples/:sampleId', 'put', {
      invalidatesTags: (_result, _error, { sampleId }) => [
        { type: 'Sample', id: 'LIST' },
        { type: 'Sample', id: sampleId },
        'SampleCount',
        { type: 'LocalPrescription', id: 'LIST' },
        { type: 'Prescription', id: 'LIST' }
      ]
    }),
    updateSampleCompliance: buildTypedMutation(
      builder,
      '/samples/:sampleId/compliance',
      'put',
      {
        invalidatesTags: (_result, _error, { sampleId }) => [
          { type: 'Sample', id: 'LIST' },
          { type: 'Sample', sampleId },
          'SampleCount',
          { type: 'LocalPrescription', id: 'LIST' },
          { type: 'Prescription', id: 'LIST' }
        ]
      }
    ),
    updateSampleItem: buildTypedMutation(
      builder,
      '/samples/:sampleId/items/:itemNumber/copy/:copyNumber',
      'put',
      {
        invalidatesTags: (_result, _error, { sampleId }) => [
          { type: 'Sample', id: sampleId },
          { type: 'SampleItemAnalysis', id: sampleId }
        ]
      }
    ),
    deleteSample: buildTypedMutation(builder, '/samples/:sampleId', 'delete', {
      invalidatesTags: (_result, _error, { sampleId }) => [
        { type: 'Sample', id: 'LIST' },
        { type: 'Sample', id: sampleId },
        'SampleCount',
        { type: 'LocalPrescription', id: 'LIST' },
        { type: 'Prescription', id: 'LIST' }
      ]
    })
  })
});

const supportDocumentURL = (
  sampleId: string,
  itemNumber?: number,
  copyNumber?: number
) => {
  return `${config.apiEndpoint}/api/samples/${sampleId}${itemNumber ? `/items/${itemNumber}` : ''}${copyNumber ? `/copy/${copyNumber}` : ''}/document`;
};

const sampleEmptyFormURL = (sampleId: string) => {
  return `${config.apiEndpoint}/api/samples/${sampleId}/emptyForm`;
};

const sampleListExportURL = (
  findOptions: Parameters<typeof getURLQuery>[0]
) => {
  const params = getURLQuery(findOptions);
  return `${config.apiEndpoint}/api/samples/export${params}`;
};

export const {
  useCreateOrUpdateSampleMutation,
  useFindSamplesQuery,
  useLazyFindSamplesQuery,
  useCountSamplesQuery,
  useGetSampleQuery,
  useLazyGetSampleQuery,
  useUpdateSampleMutation,
  useUpdateSampleComplianceMutation,
  useUpdateSampleItemMutation,
  useDeleteSampleMutation,
  getSupportDocumentURL,
  getSampleListExportURL,
  getSampleEmptyFormURL
} = {
  ...sampleApi,
  getSupportDocumentURL: supportDocumentURL,
  getSampleListExportURL: sampleListExportURL,
  getSampleEmptyFormURL: sampleEmptyFormURL
};
