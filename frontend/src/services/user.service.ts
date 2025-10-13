import { FindUserOptions } from 'maestro-shared/schema/User/FindUserOptions';
import {
  User,
  UserToCreate,
  UserToUpdate
} from 'maestro-shared/schema/User/User';
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
        response.map((_) => User.parse(_)),
      providesTags: (result) => [
        { type: 'User', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'User' as const,
          id
        }))
      ]
    }),
    updateUser: builder.mutation<void, UserToUpdate>({
      query: (user) => ({
        url: `/users/${user.id}`,
        method: 'PUT',
        body: user
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id: 'LIST' },
        { type: 'User', id }
      ]
    }),
    createUser: builder.mutation<void, UserToCreate>({
      query: (user) => ({
        url: `/users`,
        method: 'POST',
        body: user
      }),
      invalidatesTags: (_result, _error) => [{ type: 'User', id: 'LIST' }]
    })
  })
});

export const {
  useGetUserQuery,
  useFindUsersQuery,
  useLazyGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation
} = userApi;
