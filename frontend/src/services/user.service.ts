import fp from 'lodash';
import { FindUserOptions } from 'shared/schema/User/FindUserOptions';
import { UserInfos } from 'shared/schema/User/User';
import { api } from 'src/services/api.service';

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserInfos: builder.query<UserInfos, string>({
      query: (userId) => `users/${userId}/infos`,
      transformResponse: (response: any) => UserInfos.parse(response),
      providesTags: (_result, _error, userId) => [
        { type: 'UserInfos', id: userId },
      ],
    }),
    findUsers: builder.query<UserInfos[], FindUserOptions>({
      query: (findOptions) => ({
        url: `users`,
        params: findOptions,
      }),
      transformResponse: (response: any[]) =>
        response.map((_) => UserInfos.parse(fp.omitBy(_, fp.isNil))),
      providesTags: (result) => [
        { type: 'UserInfos', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'UserInfos' as const,
          id,
        })),
      ],
    }),
  }),
});

export const {
  useGetUserInfosQuery,
  useLazyGetUserInfosQuery,
  useFindUsersQuery,
} = userApi;
