import fp from 'lodash';
import { FindSubstanceAnalysisOptions } from 'shared/schema/Substance/FindSubstanceAnalysisOptions';
import { SubstanceAnalysis } from 'shared/schema/Substance/SubstanceAnalysis';
import { api } from 'src/services/api.service';

export const substanceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findSubstanceAnalysis: builder.query<
      SubstanceAnalysis[],
      FindSubstanceAnalysisOptions
    >({
      query: (findOptions) => ({
        url: 'substances/analysis',
        params: findOptions,
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => SubstanceAnalysis.parse(fp.omitBy(_, fp.isNil))),
    }),
  }),
});
export const { useFindSubstanceAnalysisQuery } = substanceApi;
