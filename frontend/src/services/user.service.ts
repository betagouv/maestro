import fp from 'lodash';
import { FindUserOptions } from 'maestro-shared/schema/User/FindUserOptions';
import { User } from 'maestro-shared/schema/User/User';
import { api } from 'src/services/api.service';

const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<User, string>({
      query: (userId) => `users/${userId}`,
      transformResponse: (response: any) => User.parse(response),
      providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }]
    }),
    findUsers: builder.query<User[], FindUserOptions>({
      query: (findOptions) => ({
        url: `users`,
        params: findOptions
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => User.parse(fp.omitBy(_, fp.isNil))),
      providesTags: (result) => [
        { type: 'User', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'User' as const,
          id
        }))
      ]
    })
  })
});

export const { useGetUserQuery, useFindUsersQuery, useLazyGetUserQuery } =
  userApi;
