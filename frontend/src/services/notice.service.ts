import { RootNotice } from 'maestro-shared/schema/RootNotice/RootNotice';
import { api } from 'src/services/api.service';

const noticeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRootNotice: builder.query<RootNotice, void>({
      query: () => 'regions.geojson',
      providesTags: ['RootNotice']
    })
  })
});

export const { useGetRootNoticeQuery } = noticeApi;
