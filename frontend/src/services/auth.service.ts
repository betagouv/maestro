import { AuthRedirectUrl } from 'shared/schema/Auth/AuthRedirectUrl';
import { AuthMaybeUnknownUser } from 'shared/schema/User/AuthUser';
import { api } from 'src/services/api.service';

export const authApi = api.injectEndpoints({
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
  useAuthenticateMutation,
  useLogoutMutation
} = authApi;
