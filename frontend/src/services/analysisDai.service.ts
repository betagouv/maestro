import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const analysisDaiApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAnalysisDai: buildTypedQuery(builder, '/analysis-dai', {
      providesTags: ['AnalysisDai']
    }),
    createAnalysisDai: buildTypedMutation(builder, '/analysis-dai', 'post', {
      invalidatesTags: ['AnalysisDai']
    })
  })
});

export const { useGetAnalysisDaiQuery, useCreateAnalysisDaiMutation } =
  analysisDaiApi;
