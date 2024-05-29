import fp from 'lodash';
import { Company } from 'shared/schema/Company/Company';
import { FindCompanyOptions } from 'shared/schema/Company/FindCompanyOptions';
import { api } from 'src/services/api.service';

export const companyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findCompanies: builder.query<Company[], FindCompanyOptions>({
      query: (findOptions) => ({
        url: 'companies',
        params: findOptions,
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => Company.parse(fp.omitBy(_, fp.isNil))),
      providesTags: (result) => [
        { type: 'Company', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({ type: 'Company' as const, id })),
      ],
    }),
  }),
});

export const { useLazyFindCompaniesQuery } = companyApi;
