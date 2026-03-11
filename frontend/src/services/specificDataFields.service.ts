import { SachaFieldConfig } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { api } from 'src/services/api.service';

const specificDataFieldsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findSachaFieldConfigs: builder.query<SachaFieldConfig[], void>({
      query: () => `/specific-data-fields/sacha`,
      providesTags: ['SampleSpecificData']
    })
  })
});

export const { useFindSachaFieldConfigsQuery } = specificDataFieldsApi;
