import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const noticeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotice: buildTypedQuery(builder, '/notices/:type', {
      providesTags: (result) =>
        result
          ? [result.type === 'root' ? 'RootNotice' : 'DashboardNotice']
          : []
    }),
    updateNotice: buildTypedMutation(builder, '/notices/:type', 'put', {
      invalidatesTags: (_result, _error, arg) => [
        arg.type === 'root' ? 'RootNotice' : 'DashboardNotice'
      ]
    })
  })
});

export const { useGetNoticeQuery, useUpdateNoticeMutation } = noticeApi;
