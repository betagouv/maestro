import fp from 'lodash';
import { Department } from 'maestro-shared/referential/Department';
import { CompanySearchResult } from 'maestro-shared/schema/Company/CompanySearchResult';
import { api } from 'src/services/api.service';

const companyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchCompanies: builder.query<
      CompanySearchResult[],
      { query: string; department?: Department }
    >({
      query: ({ query, department }) => ({
        url: 'companies/search',
        params: {
          departement: department,
          q: query
        }
      }),
      transformResponse: (response: { results: CompanySearchResult[] }) =>
        response.results.map((_) =>
          CompanySearchResult.parse(fp.omitBy(_, fp.isNil))
        ),
      transformErrorResponse: () => {
        return [];
      }
    })
  })
});

export const { useLazySearchCompaniesQuery } = companyApi;
