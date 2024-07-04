import fp from 'lodash';
import {
  AnalysisToCreate,
  PartialAnalysis,
} from 'shared/schema/Analysis/Analysis';
import { api } from 'src/services/api.service';

export const analysisApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAnalysis: builder.mutation<PartialAnalysis, AnalysisToCreate>({
      query: (draft) => ({
        url: 'analysis',
        method: 'POST',
        body: { ...draft },
      }),
      transformResponse: (response: any) =>
        PartialAnalysis.parse(fp.omitBy(response, fp.isNil)),
    }),
  }),
});

export const { useCreateAnalysisMutation } = {
  ...analysisApi,
};
