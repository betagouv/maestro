import { buildTypedMutation, buildTypedQuery } from 'src/services/api.builder';
import type {
  SampleSpecificDataAttribute,
  SampleSpecificDataAttributeValue
} from 'maestro-shared/schema/Sample/SampleSpecificDataAttribute';
import type {
  AdminFieldConfig,
  AdminFieldOption,
  CreateFieldInput,
  CreateFieldOptionInput,
  UpdateFieldInput,
  UpdateFieldOptionInput
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import type {
  SachaFieldConfig,
  SpecificDataFieldId,
  SpecificDataFieldOptionId
} from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { api } from 'src/services/api.service';

const specificDataFieldsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findAllFieldConfigs: builder.query<AdminFieldConfig[], void>({
      query: () => `/specific-data-fields`,
      providesTags: ['SpecificDataField']
    }),
    createField: builder.mutation<AdminFieldConfig, CreateFieldInput>({
      query: (body) => ({
        url: '/specific-data-fields',
        method: 'POST',
        body
      }),
      invalidatesTags: ['SpecificDataField']
    }),
    updateField: builder.mutation<
      AdminFieldConfig,
      { fieldId: SpecificDataFieldId; body: UpdateFieldInput }
    >({
      query: ({ fieldId, body }) => ({
        url: `/specific-data-fields/${fieldId}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['SpecificDataField']
    }),
    deleteField: builder.mutation<void, SpecificDataFieldId>({
      query: (fieldId) => ({
        url: `/specific-data-fields/${fieldId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['SpecificDataField']
    }),
    createFieldOption: builder.mutation<
      AdminFieldOption,
      { fieldId: SpecificDataFieldId; body: CreateFieldOptionInput }
    >({
      query: ({ fieldId, body }) => ({
        url: `/specific-data-fields/${fieldId}/options`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['SpecificDataField']
    }),
    updateFieldOption: builder.mutation<
      AdminFieldOption,
      {
        fieldId: SpecificDataFieldId;
        optionId: SpecificDataFieldOptionId;
        body: UpdateFieldOptionInput;
      }
    >({
      query: ({ fieldId, optionId, body }) => ({
        url: `/specific-data-fields/${fieldId}/options/${optionId}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['SpecificDataField']
    }),
    deleteFieldOption: builder.mutation<
      void,
      { fieldId: SpecificDataFieldId; optionId: SpecificDataFieldOptionId }
    >({
      query: ({ fieldId, optionId }) => ({
        url: `/specific-data-fields/${fieldId}/options/${optionId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['SpecificDataField']
    }),
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
