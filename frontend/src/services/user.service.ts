import { User } from 'shared/schema/User/User';
import { api } from 'src/services/api.service';

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<User, string>({
      query: (userId) => `users/${userId}`,
      transformResponse: (response: any) => User.parse(response),
      providesTags: (result, error, userId) =>
        result ? [{ type: 'User', id: userId }] : [],
    }),
  }),
});

export const { useGetUserQuery } = userApi;
