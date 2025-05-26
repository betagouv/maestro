import { isNil, omitBy } from 'lodash-es';
import { Substance } from 'maestro-shared/schema/Substance/Substance';
import { api } from 'src/services/api.service';

const substanceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchSubstances: builder.query<Substance[], string>({
      query: (query) => ({
        url: 'substances/search',
        params: {
          q: query
        }
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => Substance.parse(omitBy(_, isNil)))
    })
  })
});

export const { useLazySearchSubstancesQuery } = substanceApi;
