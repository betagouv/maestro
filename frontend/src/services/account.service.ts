import { AuthUser } from 'src/models/User';
import { api } from 'src/services/api.service';

export const accountApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation<AuthUser, { email: string; password: string }>({
      query: ({ email, password }) => ({
        url: 'accounts/sign-in',
        method: 'POST',
        body: { email, password },
      }),
      transformResponse: (result: any) => ({
        userId: result.userId,
        accessToken: result.accessToken,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useSignInMutation } = accountApi;
