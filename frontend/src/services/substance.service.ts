import fp from 'lodash';
import { Substance } from 'maestro-shared/schema/Substance/Substance';
import { api } from 'src/services/api.service';

export const substanceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchSubstances: builder.query<Substance[], string>({
      query: (query) => ({
        url: 'substances/search',
        params: {
          q: query
        }
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => Substance.parse(fp.omitBy(_, fp.isNil)))
    })
  })
});

export const { useLazySearchSubstancesQuery } = substanceApi;
