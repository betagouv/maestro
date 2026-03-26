import { api } from 'src/services/api.service';

const regionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // biome-ignore lint: static file
    getRegionsGeoJson: builder.query<JSON, void>({
      query: () => 'regions.geojson',
      providesTags: ['Regions']
    })
  })
});

export const { useGetRegionsGeoJsonQuery } = regionApi;
