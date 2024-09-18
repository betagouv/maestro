import fp from 'lodash';
import {
  AnalysisToCreate,
  PartialAnalysis,
} from 'shared/schema/Analysis/Analysis';
import { api } from 'src/services/api.service';
import { authParams } from 'src/services/auth-headers';
import config from 'src/utils/config';
import { getURLQuery } from 'src/utils/fetchUtils';

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

const analysisExtractURL = (analysis: PartialAnalysis) => {
  const params = getURLQuery({
    ...authParams(),
  });
  return `${config.apiEndpoint}/api/analysis/${analysis.id}/extract${params}`;
};

export const {
  useGetSampleAnalysisQuery,
  useCreateAnalysisMutation,
  useUpdateAnalysisMutation,
  getAnalysisExtractURL,
} = {
  ...analysisApi,
  getAnalysisExtractURL: analysisExtractURL,
};
