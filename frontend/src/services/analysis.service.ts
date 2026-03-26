import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const analysisApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSampleItemAnalysis: buildTypedQuery(builder, '/analysis', {
      providesTags: (_result, _error, { sampleId }) => [
        { type: 'SampleItemAnalysis', id: sampleId }
      ]
    }),
    createAnalysis: buildTypedMutation(builder, '/analysis', 'post', {
      invalidatesTags: (_result, _error, draft) => [
        { type: 'SampleItemAnalysis', id: draft.sampleId },
        { type: 'Sample' as const, id: draft.sampleId },
        { type: 'Sample', id: 'LIST' }
      ]
    }),
    updateAnalysis: buildTypedMutation(
      builder,
      '/analysis/:analysisId',
      'put',
      {
        invalidatesTags: (result, _error, _draft) => [
          { type: 'SampleItemAnalysis', id: result?.sampleId },
          { type: 'Sample' as const, id: result?.sampleId },
          { type: 'Sample', id: 'LIST' }
        ]
      }
    ),
    getAnalysisReportDocumentIds: buildTypedQuery(
      builder,
      '/analysis/:analysisId/reportDocuments',
      {
        providesTags: (_result, _error, { analysisId }) => [
          { type: 'AnalysisReportDocuments', id: analysisId }
        ]
      }
    ),
    createAnalysisReportDocument: buildTypedMutation(
      builder,
      '/analysis/:analysisId/reportDocuments',
      'post',
      {
        invalidatesTags: (_result, _error, { analysisId }) => [
          { type: 'AnalysisReportDocuments', id: analysisId }
        ]
      }
    ),
    deleteAnalysisReportDocument: buildTypedMutation(
      builder,
      '/analysis/:analysisId/reportDocuments',
      'delete',
      {
        invalidatesTags: (_result, _error, { analysisId }) => [
          { type: 'AnalysisReportDocuments', id: analysisId }
        ]
      }
    )
  })
});

export const {
  useCreateAnalysisMutation,
  useUpdateAnalysisMutation,
  useGetSampleItemAnalysisQuery,
  useLazyGetSampleItemAnalysisQuery,
  useCreateAnalysisReportDocumentMutation,
  useGetAnalysisReportDocumentIdsQuery,
  useLazyGetAnalysisReportDocumentIdsQuery,
  useDeleteAnalysisReportDocumentMutation
} = analysisApi;
