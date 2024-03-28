import { UserInfos } from 'shared/schema/User/User';
import { api } from 'src/services/api.service';

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserInfos: builder.query<UserInfos, string>({
      query: (userId) => `users/${userId}/infos`,
      transformResponse: (response: any) => UserInfos.parse(response),
      providesTags: (result, error, userId) =>
        result ? [{ type: 'UserInfos', id: userId }] : [],
    }),
  }),
});

export const { useGetUserInfosQuery } = userApi;
