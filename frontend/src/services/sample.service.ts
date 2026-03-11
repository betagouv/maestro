import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { isNil, omitBy } from 'lodash-es';
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  isCreatedPartialSample,
  PartialSample,
  PartialSampleToCreate,
  SampleChecked,
  SampleComplianceData
} from 'maestro-shared/schema/Sample/Sample';
import {
  SampleItemKey,
  SampleItemUpdate
} from 'maestro-shared/schema/Sample/SampleItem';
import { api } from 'src/services/api.service';
import samplesSlice from 'src/store/reducers/samplesSlice';
import { store } from 'src/store/store';
import config from 'src/utils/config';
import { getURLQuery } from 'src/utils/fetchUtils';

const sampleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSample: builder.query<PartialSample, string>({
      query: (sampleId) => `samples/${sampleId}`,
      transformResponse: (response: any) =>
        PartialSample.parse(omitBy(response, isNil)),
      providesTags: (_result, _error, sampleId) => [
        { type: 'Sample', id: sampleId }
      ]
    }),
    findSamples: builder.query<PartialSample[], FindSampleOptions>({
      query: (findOptions) => ({
        url: 'samples',
        params: findOptions
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => PartialSample.parse(omitBy(_, isNil))),
      providesTags: (result) => [
        { type: 'Sample', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({ type: 'Sample' as const, id }))
      ]
    }),
    countSamples: builder.query<number, FindSampleOptions>({
      query: (findOptions) => ({
        url: 'samples/count',
        params: findOptions
      }),
      transformResponse: (response: { count: number }) =>
        Number(response.count),
      providesTags: ['SampleCount']
    }),
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
    updateSample: builder.mutation<
      PartialSample,
      PartialSample | SampleChecked
    >({
      query: (partialSample) => ({
        url: `samples/${partialSample.id}`,
        method: 'PUT',
        body: partialSample
      }),
      transformResponse: (response: any) =>
        PartialSample.parse(omitBy(response, isNil)),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Sample', id: 'LIST' },
        { type: 'Sample', id },
        'SampleCount',
        { type: 'LocalPrescription', id: 'LIST' },
        { type: 'Prescription', id: 'LIST' }
      ]
    }),
    updateSampleCompliance: builder.mutation<
      SampleComplianceData,
      SampleComplianceData & { sampleId: string }
    >({
      query: ({ sampleId, ...complianceData }) => ({
        url: `samples/${sampleId}/compliance`,
        method: 'PUT',
        body: complianceData
      }),
      transformResponse: (response: any) =>
        SampleComplianceData.parse(omitBy(response, isNil)),
      invalidatesTags: (_result, _error, { sampleId }) => [
        { type: 'Sample', id: 'LIST' },
        { type: 'Sample', sampleId },
        'SampleCount',
        { type: 'LocalPrescription', id: 'LIST' },
        { type: 'Prescription', id: 'LIST' }
      ]
    }),
    updateSampleItem: builder.mutation<
      void,
      SampleItemKey & { sampleItemUpdate: SampleItemUpdate }
    >({
      query: ({ sampleId, itemNumber, copyNumber, sampleItemUpdate }) => ({
        url: `samples/${sampleId}/items/${itemNumber}/copy/${copyNumber}`,
        method: 'PUT',
        body: sampleItemUpdate
      }),
      invalidatesTags: (_result, _error, { sampleId }) => [
        { type: 'Sample', id: sampleId },
        { type: 'SampleItemAnalysis', id: sampleId }
      ]
    }),
    deleteSample: builder.mutation<void, string>({
      query: (id) => ({
        url: `samples/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Sample', id: 'LIST' },
        { type: 'Sample', id },
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

const sampleListExportURL = (findOptions: FindSampleOptions) => {
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
