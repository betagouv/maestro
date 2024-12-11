import { AuthRedirectUrl } from 'shared/schema/Auth/AuthRedirectUrl';
import { AuthUser } from 'shared/schema/User/AuthUser';
import { api } from 'src/services/api.service';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation<AuthUser, { email: string; password: string }>({
      query: ({ email, password }) => ({
        url: 'auth/sign-in',
        method: 'POST',
        body: { email, password }
      }),
      transformResponse: (result: any) => AuthUser.parse(result),
      invalidatesTags: ['AuthUser']
    }),
    getAuthRedirectUrl: builder.query<AuthRedirectUrl, void>({
      query: () => 'auth/redirect-url'
    }),
    authenticate: builder.mutation<AuthUser, AuthRedirectUrl>({
      query: (authRedirectUrl) => ({
        url: 'auth',
        method: 'POST',
        body: authRedirectUrl
      }),
      transformResponse: (result: any) => AuthUser.parse(result),
      invalidatesTags: ['AuthUser']
    })
  })
});

export const {
  useSignInMutation,
  useGetAuthRedirectUrlQuery,
  useAuthenticateMutation
} = authApi;
