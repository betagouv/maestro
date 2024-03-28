import { AuthUser } from 'shared/schema/User/AuthUser';
import { api } from 'src/services/api.service';

export const accountApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation<AuthUser, { email: string; password: string }>({
      query: ({ email, password }) => ({
        url: 'accounts/sign-in',
        method: 'POST',
        body: { email, password },
      }),
      transformResponse: (result: any) => AuthUser.parse(result),
      invalidatesTags: ['AuthUser'],
    }),
  }),
});

export const { useSignInMutation } = accountApi;
