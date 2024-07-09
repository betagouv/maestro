import fp from 'lodash';
import {
  AnalysisToCreate,
  PartialAnalysis,
} from 'shared/schema/Analysis/Analysis';
import { api } from 'src/services/api.service';

export const analysisApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAnalysis: builder.query<PartialAnalysis, string>({
      query: (sampleId) => `analysis/${sampleId}`,
      transformResponse: (response: any) =>
        PartialAnalysis.parse(fp.omitBy(response, fp.isNil)),
      providesTags: (_result, _error, sampleId) => [
        { type: 'Analysis', id: sampleId },
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
    }),
    updateAnalysis: builder.mutation<PartialAnalysis, PartialAnalysis>({
      query: (partialAnalysis) => ({
        url: `analysis/${partialAnalysis.id}`,
        method: 'PUT',
        body: partialAnalysis,
      }),
      transformResponse: (response: any) =>
        PartialAnalysis.parse(fp.omitBy(response, fp.isNil)),
      invalidatesTags: (result, error, draft) => [
        { type: 'Analysis', id: draft.id },
      ],
    }),
  }),
});

export const {
  useGetAnalysisQuery,
  useCreateAnalysisMutation,
  useUpdateAnalysisMutation,
} = {
  ...analysisApi,
};
