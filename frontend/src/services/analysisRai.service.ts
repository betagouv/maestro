import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const analysisRaiApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAnalysisRai: buildTypedQuery(builder, '/analysis-rai', {
      providesTags: ['AnalysisRai']
    }),
    replayAnalysisRai: buildTypedMutation(
      builder,
      '/analysis-rai/:analysisRaiId/replay',
      'post',
      { invalidatesTags: ['AnalysisRai'] }
    )
  })
});

export const { useGetAnalysisRaiQuery, useReplayAnalysisRaiMutation } =
  analysisRaiApi;
