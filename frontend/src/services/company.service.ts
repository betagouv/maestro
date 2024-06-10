import fp from 'lodash';
import { Department } from 'shared/referential/Department';
import { CompanySearchResult } from 'shared/schema/Company/CompanySearchResult';
import { api } from 'src/services/api.service';

export const companyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchCompanies: builder.query<
      CompanySearchResult[],
      { query: string; department: Department }
    >({
      query: ({ query, department }) => ({
        url: 'companies/search',
        params: {
          departement: department,
          q: query,
        },
      }),
      transformResponse: (response: { results: CompanySearchResult[] }) =>
        response.results.map((_) =>
          CompanySearchResult.parse(fp.omitBy(_, fp.isNil))
        ),
    }),
  }),
});

export const { useLazySearchCompaniesQuery } = companyApi;
