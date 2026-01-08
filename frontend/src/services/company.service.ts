import { isNil, omitBy } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import { Company } from 'maestro-shared/schema/Company/Company';
import { CompanySearchResult } from 'maestro-shared/schema/Company/CompanySearchResult';
import { FindCompanyOptions } from 'maestro-shared/schema/Company/FindCompanyOptions';
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
    findCompanies: builder.query<Company[], FindCompanyOptions>({
      query: (findOptions) => ({
        url: `companies`,
        params: findOptions
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => Company.parse(omitBy(_, isNil))),
      providesTags: (result) => [
        { type: 'Company', id: 'LIST' },
        ...(result ?? []).map(({ siret }) => ({
          type: 'Company' as const,
          siret
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
