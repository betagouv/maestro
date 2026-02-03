import { SachaCommemoratifRecord } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { api } from 'src/services/api.service';

const sachaCommemoratifsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSachaCommemoratifs: builder.query<SachaCommemoratifRecord, void>({
      query: () => '/sacha/commemoratifs',
      providesTags: ['SachaCommemoratif']
    }),
    updateSachaCommemoratifs: builder.mutation<void, string>({
      query: (xmlContent) => ({
        url: '/sacha/commemoratifs',
        method: 'POST',
        body: { xmlContent }
      }),
      invalidatesTags: ['SachaCommemoratif']
    })
  })
});

export const {
  useGetSachaCommemoratifsQuery,
  useUpdateSachaCommemoratifsMutation
} = sachaCommemoratifsApi;
