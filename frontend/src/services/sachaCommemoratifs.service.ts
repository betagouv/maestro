import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const sachaCommemoratifsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSachaCommemoratifs: buildTypedQuery(builder, '/sacha/commemoratifs', {
      providesTags: ['SachaCommemoratif']
    }),
    findSachaContexts: buildTypedQuery(builder, '/sacha/contexts', {
      providesTags: ['SachaContext']
    }),
    updateSachaReferential: buildTypedMutation(
      builder,
      '/sacha/referentials',
      'post',
      {
        invalidatesTags: ['SachaCommemoratif', 'SachaContext']
      }
    )
  })
});

export const {
  useGetSachaCommemoratifsQuery,
  useFindSachaContextsQuery,
  useUpdateSachaReferentialMutation
} = sachaCommemoratifsApi;
