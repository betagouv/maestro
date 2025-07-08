import { Notice } from 'maestro-shared/schema/Notice/Notice';
import { api } from 'src/services/api.service';

const noticeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRootNotice: builder.query<Notice, void>({
      query: () => '/notices/root',
      providesTags: ['RootNotice']
    }),
    updateRootNotice: builder.mutation<void, Notice>({
      query: (notice) => ({
        url: `/notices/root`,
        method: 'PUT',
        body: notice
      }),
      invalidatesTags: (_result, _error) => ['RootNotice']
    })
  })
});

export const { useGetRootNoticeQuery, useUpdateRootNoticeMutation } = noticeApi;
