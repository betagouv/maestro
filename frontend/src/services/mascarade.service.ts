import { api } from 'src/services/api.service';

const mascaradeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    mascaradeStart: builder.mutation<void, { userId: string }>({
      query: ({ userId }) => ({
        url: `/mascarade/${userId}`,
        method: 'POST'
      })
    }),
    mascaradeStop: builder.mutation<{ userId: string }, void>({
      query: () => ({
        url: `/mascarade`,
        method: 'POST'
      })
    })
  })
});

export const { useMascaradeStartMutation, useMascaradeStopMutation } =
  mascaradeApi;
