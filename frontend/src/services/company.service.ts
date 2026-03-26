import { isNil, omitBy } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import { CompanySearchResult } from 'maestro-shared/schema/Company/CompanySearchResult';
import { api } from 'src/services/api.service';
import { buildTypedQuery } from './api.builder';

const companyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // biome-ignore lint: external API
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
          //I - Services d'hébergement et de restauration
          section_activite_principale: 'A,I'
        }
      }),
      transformResponse: (response: { results: CompanySearchResult[] }) =>
        response.results.map((_) =>
          CompanySearchResult.parse(omitBy(_, isNil))
        ),
      transformErrorResponse: () => {
        return [];
      }
    }),
    findCompanies: buildTypedQuery(builder, '/companies', {
      providesTags: (result) => [
        { type: 'Company', id: 'LIST' },
        ...(result ?? []).map(({ siret }) => ({
          type: 'Company' as const,
          id: siret
        }))
      ]
    })
  })
});

export const {
  useLazySearchCompaniesQuery,
  useFindCompaniesQuery,
  useLazyFindCompaniesQuery
} = companyApi;
