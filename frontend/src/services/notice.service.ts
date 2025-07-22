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
    }),
    getDashboardNotice: builder.query<Notice, void>({
      query: () => '/notices/dashboard',
      providesTags: ['DashboardNotice']
    }),
    updateDashboardNotice: builder.mutation<void, Notice>({
      query: (notice) => ({
        url: `/notices/dashboard`,
        method: 'PUT',
        body: notice
      }),
      invalidatesTags: (_result, _error) => ['DashboardNotice']
    })
  })
});

export const {
  useGetRootNoticeQuery,
  useUpdateRootNoticeMutation,
  useGetDashboardNoticeQuery,
  useUpdateDashboardNoticeMutation
} = noticeApi;
