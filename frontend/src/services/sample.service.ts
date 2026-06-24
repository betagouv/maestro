import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { isNil, omitBy } from 'lodash-es';
import type { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  isCreatedPartialSample,
  PartialSample,
  type PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';
import samplesSlice from 'src/store/reducers/samplesSlice';
import { store } from 'src/store/store';
import { getApiUrl } from 'src/utils/fetchUtils';

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

export const getSupportDocumentURL = (
  sampleId: string,
  itemNumber?: number,
  copyNumber?: number
) =>
  itemNumber && copyNumber
    ? getApiUrl(
        '/samples/:sampleId/items/:itemNumber/copy/:copyNumber/document',
        { sampleId, itemNumber, copyNumber }
      )
    : getApiUrl('/samples/:sampleId/document', { sampleId });

export const getSampleEmptyFormURL = (sampleId: string) =>
  getApiUrl('/samples/:sampleId/emptyForm', { sampleId });

export const getSampleListExportURL = (findOptions: FindSampleOptions) =>
  getApiUrl('/samples/export', findOptions);

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
  useDeleteSampleMutation
} = sampleApi;
