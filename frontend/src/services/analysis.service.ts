import {
  Analysis,
  AnalysisToCreate,
  AnalysisToUpdate,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import { api } from 'src/services/api.service';

const analysisApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSampleAnalysis: builder.query<PartialAnalysis, string>({
      query: (sampleId) => ({
        url: 'analysis',
        params: { sampleId }
      }),
      transformResponse: (response: any) => PartialAnalysis.parse(response),
      providesTags: (_result, _error, sampleId) => [
        { type: 'SampleAnalysis', id: sampleId }
      ]
    }),
    createAnalysis: builder.mutation<PartialAnalysis, AnalysisToCreate>({
      query: (draft) => ({
        url: 'analysis',
        method: 'POST',
        body: { ...draft }
      }),
      transformResponse: (response: any) => PartialAnalysis.parse(response),
      invalidatesTags: (_result, _error, draft) => [
        { type: 'SampleAnalysis', id: draft.sampleId },
        { type: 'Sample' as const, id: draft.sampleId },
        { type: 'Sample', id: 'LIST' }
      ]
    }),
    updateAnalysis: builder.mutation<
      PartialAnalysis,
      AnalysisToUpdate & Pick<Analysis, 'id' | 'sampleId'>
    >({
      query: (partialAnalysis) => ({
        url: `analysis/${partialAnalysis.id}`,
        method: 'PUT',
        body: partialAnalysis
      }),
      transformResponse: (response: any) => PartialAnalysis.parse(response),
      invalidatesTags: (_result, _error, draft) => [
        { type: 'SampleAnalysis', id: draft.sampleId },
        { type: 'Sample' as const, id: draft.sampleId },
        { type: 'Sample', id: 'LIST' }
      ]
    }),
    getAnalysisReportDocumentIds: builder.query<string[], string>({
      query: (analysisId) => ({
        url: `analysis/${analysisId}/reportDocuments`
      }),
      providesTags: (_result, _error, analysisId) => [
        { type: 'AnalysisReportDocuments', id: analysisId }
      ]
    }),
    createAnalysisReportDocument: builder.mutation<
      void,
      { documentId: string; analysisId: string; sampleId: string }
    >({
      query: ({ documentId, analysisId }) => ({
        url: `analysis/${analysisId}/reportDocuments`,
        method: 'POST',
        body: { documentId }
      }),
      invalidatesTags: (_result, _error, { analysisId }) => [
        { type: 'AnalysisReportDocuments', id: analysisId }
      ]
    }),
    deleteAnalysisReportDocument: builder.mutation<
      void,
      { documentId: string; analysisId: string; sampleId: string }
    >({
      query: ({ documentId, analysisId }) => ({
        url: `analysis/${analysisId}/reportDocuments`,
        method: 'DELETE',
        body: { documentId }
      }),
      invalidatesTags: (_result, _error, { analysisId }) => [
        { type: 'AnalysisReportDocuments', id: analysisId }
      ]
    })
  })
});

export const {
  useCreateAnalysisMutation,
  useUpdateAnalysisMutation,
  useGetSampleAnalysisQuery,
  useLazyGetSampleAnalysisQuery,
  useCreateAnalysisReportDocumentMutation,
  useGetAnalysisReportDocumentIdsQuery,
  useLazyGetAnalysisReportDocumentIdsQuery,
  useDeleteAnalysisReportDocumentMutation
} = analysisApi;
