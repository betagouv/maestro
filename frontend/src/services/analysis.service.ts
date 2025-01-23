import fp from 'lodash';
import {
  AnalysisToCreate,
  PartialAnalysis,
} from 'maestro-shared/schema/Analysis/Analysis';
import { api } from 'src/services/api.service';

export const analysisApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSampleAnalysis: builder.query<PartialAnalysis, string>({
      query: (sampleId) => ({
        url: 'analysis',
        params: { sampleId },
      }),
      transformResponse: (response: any) =>
        PartialAnalysis.parse(fp.omitBy(response, fp.isNil)),
      providesTags: (_result, _error, sampleId) => [
        { type: 'SampleAnalysis', id: sampleId },
      ],
    }),
    createAnalysis: builder.mutation<PartialAnalysis, AnalysisToCreate>({
      query: (draft) => ({
        url: 'analysis',
        method: 'POST',
        body: { ...draft },
      }),
      transformResponse: (response: any) =>
        PartialAnalysis.parse(fp.omitBy(response, fp.isNil)),
      invalidatesTags: (_result, _error, draft) => [
        { type: 'SampleAnalysis', id: draft.sampleId },
        { type: 'Sample' as const, id: draft.sampleId },
        { type: 'Sample', id: 'LIST' },
      ],
    }),
    updateAnalysis: builder.mutation<PartialAnalysis, PartialAnalysis>({
      query: (partialAnalysis) => ({
        url: `analysis/${partialAnalysis.id}`,
        method: 'PUT',
        body: partialAnalysis,
      }),
      transformResponse: (response: any) =>
        PartialAnalysis.parse(fp.omitBy(response, fp.isNil)),
      invalidatesTags: (_result, _error, draft) => [
        { type: 'SampleAnalysis', id: draft.sampleId },
        { type: 'Sample' as const, id: draft.sampleId },
        { type: 'Sample', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetSampleAnalysisQuery,
  useCreateAnalysisMutation,
  useUpdateAnalysisMutation,
} = {
  ...analysisApi,
};
