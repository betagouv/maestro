import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUser: buildTypedQuery(builder, '/users/:userId', {
      providesTags: (_result, _error, { userId }) => [
        { type: 'User', id: userId }
      ]
    }),
    findUsers: buildTypedQuery(builder, '/users', {
      providesTags: (result) => [
        { type: 'User', id: 'LIST' },
        ...(result ?? []).map(({ id }) => ({
          type: 'User' as const,
          id
        }))
      ]
    }),
    updateUser: buildTypedMutation(builder, '/users/:userId', 'put', {
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'User', id: 'LIST' },
        { type: 'User', id: userId }
      ]
    }),
    createUser: buildTypedMutation(builder, '/users', 'post', {
      invalidatesTags: [{ type: 'User', id: 'LIST' }]
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
