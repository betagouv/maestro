import { isNil, omitBy } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import {
  AddressSearchResult,
  type AddressSearchResults
} from 'maestro-shared/schema/Address/AddressSearchResult';
import { api } from 'src/services/api.service';

const addressApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchAddresses: builder.query<
      AddressSearchResult[],
      { query: string; department?: Department }
    >({
      query: ({ query }) => ({
        url: 'addresses/search',
        params: {
          // type: 'municipality',
          q: query
        }
      }),
      transformResponse: (response: AddressSearchResults) =>
        response.features.map((_) =>
          AddressSearchResult.parse(omitBy(_, isNil))
        ),
      transformErrorResponse: () => {
        return [];
      }
    })
  })
});

export const { useLazySearchAddressesQuery } = addressApi;
