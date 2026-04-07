import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const sachaCommemoratifsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSachaCommemoratifs: buildTypedQuery(builder, '/sacha/commemoratifs', {
      providesTags: ['SachaCommemoratif']
    }),
    updateSachaCommemoratifs: buildTypedMutation(
      builder,
      '/sacha/commemoratifs',
      'post',
      {
        invalidatesTags: ['SachaCommemoratif']
      }
    )
  })
});

export const {
  useGetSachaCommemoratifsQuery,
  useUpdateSachaCommemoratifsMutation
} = sachaCommemoratifsApi;
