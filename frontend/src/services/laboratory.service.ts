import { isNil, omitBy } from 'lodash-es';
import { FindLaboratoryOptions } from 'maestro-shared/schema/Laboratory/FindLaboratoryOptions';
import { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import { api } from 'src/services/api.service';

const laboratoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLaboratory: builder.query<Laboratory, string>({
      query: (laboratoryId) => `laboratories/${laboratoryId}`,
      transformResponse: (response: any) =>
        Laboratory.parse(omitBy(response, isNil)),
      providesTags: (_result, _error, laboratoryId) => [
        { type: 'Laboratory', id: laboratoryId }
      ]
    }),
    findLaboratories: builder.query<Laboratory[], FindLaboratoryOptions>({
      query: (findOptions) => ({
        url: 'laboratories',
        params: omitBy(findOptions, isNil)
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => Laboratory.parse(omitBy(_, isNil))),
      providesTags: (result) => [
        { type: 'Laboratory', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'Laboratory' as const,
          id
        }))
      ]
    })
  })
});

export const { useGetLaboratoryQuery, useFindLaboratoriesQuery } =
  laboratoryApi;
