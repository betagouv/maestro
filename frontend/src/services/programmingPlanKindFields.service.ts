import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  CreatePlanKindFieldInput,
  UpdatePlanKindFieldInput
} from 'maestro-shared/schema/SpecificData/FieldConfigInput';
import {
  PlanKindFieldConfig,
  ProgrammingPlanKindFieldId,
  SpecificDataFieldOptionId
} from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { api } from 'src/services/api.service';

const programmingPlanKindFieldsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findPlanKindFieldConfigs: builder.query<
      PlanKindFieldConfig[],
      { programmingPlanId: string; kind: ProgrammingPlanKind }
    >({
      query: ({ programmingPlanId, kind }) =>
        `/programming-plans/${programmingPlanId}/kinds/${kind}/specific-data-fields`,
      providesTags: ['SpecificDataField']
    }),
    addPlanKindField: builder.mutation<
      PlanKindFieldConfig,
      {
        programmingPlanId: string;
        kind: ProgrammingPlanKind;
        body: CreatePlanKindFieldInput;
      }
    >({
      query: ({ programmingPlanId, kind, body }) => ({
        url: `/programming-plans/${programmingPlanId}/kinds/${kind}/specific-data-fields`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['SpecificDataField']
    }),
    updatePlanKindField: builder.mutation<
      PlanKindFieldConfig,
      {
        programmingPlanId: string;
        kind: ProgrammingPlanKind;
        planKindFieldId: ProgrammingPlanKindFieldId;
        body: UpdatePlanKindFieldInput;
      }
    >({
      query: ({ programmingPlanId, kind, planKindFieldId, body }) => ({
        url: `/programming-plans/${programmingPlanId}/kinds/${kind}/specific-data-fields/${planKindFieldId}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['SpecificDataField']
    }),
    deletePlanKindField: builder.mutation<
      void,
      {
        programmingPlanId: string;
        kind: ProgrammingPlanKind;
        planKindFieldId: ProgrammingPlanKindFieldId;
      }
    >({
      query: ({ programmingPlanId, kind, planKindFieldId }) => ({
        url: `/programming-plans/${programmingPlanId}/kinds/${kind}/specific-data-fields/${planKindFieldId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['SpecificDataField']
    }),
    updatePlanKindFieldOptions: builder.mutation<
      void,
      {
        programmingPlanId: string;
        kind: ProgrammingPlanKind;
        planKindFieldId: ProgrammingPlanKindFieldId;
        body: SpecificDataFieldOptionId[];
      }
    >({
      query: ({ programmingPlanId, kind, planKindFieldId, body }) => ({
        url: `/programming-plans/${programmingPlanId}/kinds/${kind}/specific-data-fields/${planKindFieldId}/options`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['SpecificDataField']
    })
  })
});

export const {
  useFindPlanKindFieldConfigsQuery,
  useAddPlanKindFieldMutation,
  useUpdatePlanKindFieldMutation,
  useDeletePlanKindFieldMutation,
  useUpdatePlanKindFieldOptionsMutation
} = programmingPlanKindFieldsApi;
