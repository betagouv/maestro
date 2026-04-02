import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const specificDataFieldsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findAllFieldConfigs: buildTypedQuery(builder, '/specific-data-fields', {
      providesTags: ['SpecificDataField']
    }),
    createField: buildTypedMutation(builder, '/specific-data-fields', 'post', {
      invalidatesTags: ['SpecificDataField']
    }),
    updateField: buildTypedMutation(
      builder,
      '/specific-data-fields/:fieldId',
      'put',
      {
        invalidatesTags: ['SpecificDataField']
      }
    ),
    deleteField: buildTypedMutation(
      builder,
      '/specific-data-fields/:fieldId',
      'delete',
      {
        invalidatesTags: ['SpecificDataField']
      }
    ),
    createFieldOption: buildTypedMutation(
      builder,
      '/specific-data-fields/:fieldId/options',
      'post',
      {
        invalidatesTags: ['SpecificDataField']
      }
    ),
    updateFieldOption: buildTypedMutation(
      builder,
      '/specific-data-fields/:fieldId/options/:optionId',
      'put',
      {
        invalidatesTags: ['SpecificDataField']
      }
    ),
    deleteFieldOption: buildTypedMutation(
      builder,
      '/specific-data-fields/:fieldId/options/:optionId',
      'delete',
      {
        invalidatesTags: ['SpecificDataField']
      }
    ),
    findSachaFieldConfigs: buildTypedQuery(
      builder,
      '/specific-data-fields/sacha',
      {
        providesTags: ['SampleSpecificData']
      }
    ),
    updateSampleSpecificDataAttribute: buildTypedMutation(
      builder,
      '/specific-data-fields/attribute',
      'post',
      {
        invalidatesTags: ['SampleSpecificData']
      }
    ),
    updateSampleSpecificDataAttributeValue: buildTypedMutation(
      builder,
      '/specific-data-fields/attribute/value',
      'post',
      {
        invalidatesTags: ['SampleSpecificData']
      }
    )
  })
});

export const {
  useFindAllFieldConfigsQuery,
  useCreateFieldMutation,
  useUpdateFieldMutation,
  useDeleteFieldMutation,
  useCreateFieldOptionMutation,
  useUpdateFieldOptionMutation,
  useDeleteFieldOptionMutation,
  useFindSachaFieldConfigsQuery,
  useUpdateSampleSpecificDataAttributeMutation,
  useUpdateSampleSpecificDataAttributeValueMutation
} = specificDataFieldsApi;
