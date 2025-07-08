import { Notice } from 'shared/schema/RootNotice/Notice';
import { api } from 'src/services/api.service';

const noticeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRootNotice: builder.query<Notice, void>({
      query: () => 'regions.geojson',
      providesTags: ['RootNotice']
    })
  })
});

export const { useGetRootNoticeQuery } = noticeApi;
