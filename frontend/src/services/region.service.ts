import { api } from 'src/services/api.service';

const regionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRegionsGeoJson: builder.query<JSON, void>({
      query: () => 'regions.geojson',
      providesTags: ['Regions']
    })
  })
});

export const { useGetRegionsGeoJsonQuery } = regionApi;
