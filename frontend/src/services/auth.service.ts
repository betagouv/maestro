import { AuthRedirectUrl } from 'maestro-shared/schema/Auth/AuthRedirectUrl';
import { AuthMaybeUnknownUser } from 'maestro-shared/schema/User/AuthUser';
import { UserRole } from 'maestro-shared/schema/User/UserRole';
import { api } from 'src/services/api.service';

const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAuthRedirectUrl: builder.query<AuthRedirectUrl, void>({
      query: () => 'auth/redirect-url',
      transformResponse: (result: any) => AuthRedirectUrl.parse(result)
    }),
    authenticate: builder.mutation<AuthMaybeUnknownUser, AuthRedirectUrl>({
      query: (authRedirectUrl) => ({
        url: 'auth',
        method: 'POST',
        body: authRedirectUrl
      }),
      transformResponse: (result: any) => AuthMaybeUnknownUser.parse(result),
      invalidatesTags: ['AuthUser']
    }),
    changeRole: builder.mutation<AuthMaybeUnknownUser, UserRole>({
      query: (newRole) => ({
        url: 'auth/role',
        method: 'POST',
        body: { newRole }
      }),
      transformResponse: (result: any) => AuthMaybeUnknownUser.parse(result),
      invalidatesTags: ['AuthUser']
    }),
    logout: builder.mutation<AuthRedirectUrl, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST'
      }),
      transformResponse: (result: any) => AuthRedirectUrl.parse(result),
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
