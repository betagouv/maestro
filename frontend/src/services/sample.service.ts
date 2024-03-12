import { SampleToCreate } from 'shared/schema/Sample';
import { api } from 'src/services/api.service';

export const sampleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createSample: builder.mutation<void, SampleToCreate>({
      query: (draft) => ({
        url: 'samples',
        method: 'POST',
        body: { ...draft },
      }),
    }),
  }),
});

export const { useCreateSampleMutation } = sampleApi;
