import { isNil, omitBy } from 'lodash-es';
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
          q: query,
          //"A" pour Active
          etat_administratif: 'A',
          //A - Agriculture, sylviculture et pêche,
          section_activite_principale: 'A'
        }
      }),
      transformResponse: (response: { results: CompanySearchResult[] }) =>
        response.results.map((_) =>
          CompanySearchResult.parse(omitBy(_, isNil))
        ),
      transformErrorResponse: () => {
        return [];
      }
    })
  })
});

export const { useLazySearchCompaniesQuery } = companyApi;
