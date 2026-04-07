import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAuthRedirectUrl: buildTypedQuery(builder, '/auth/redirect-url'),
    authenticate: buildTypedMutation(builder, '/auth', 'post', {
      invalidatesTags: ['AuthUser']
    }),
    changeRole: buildTypedMutation(builder, '/auth/role', 'post', {
      invalidatesTags: ['AuthUser']
    }),
    logout: buildTypedMutation(builder, '/auth/logout', 'post', {
      invalidatesTags: ['AuthUser']
    })
  })
});

export const {
  useGetAuthRedirectUrlQuery,
  useChangeRoleMutation,
  useAuthenticateMutation,
  useLogoutMutation
} = authApi;
