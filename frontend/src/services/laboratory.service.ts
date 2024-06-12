import fp from 'lodash';
import { Laboratory } from 'shared/schema/Laboratory/Laboratory';
import { api } from 'src/services/api.service';

export const laboratoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLaboratory: builder.query<Laboratory, string>({
      query: (laboratoryId) => `laboratories/${laboratoryId}`,
      transformResponse: (response: any) =>
        Laboratory.parse(fp.omitBy(response, fp.isNil)),
      providesTags: (_result, _error, laboratoryId) => [
        { type: 'Laboratory', id: laboratoryId },
      ],
    }),
    findLaboratories: builder.query<Laboratory[], void>({
      query: () => 'laboratories',
      transformResponse: (response: any[]) =>
        response.map((_) => Laboratory.parse(fp.omitBy(_, fp.isNil))),
      providesTags: (result) => [
        { type: 'Laboratory', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'Laboratory' as const,
          id,
        })),
      ],
    }),
  }),
});

export const { useGetLaboratoryQuery, useFindLaboratoriesQuery } =
  laboratoryApi;
