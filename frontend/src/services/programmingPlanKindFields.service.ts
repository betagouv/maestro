import type { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import type { PlanKindFieldConfig } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { api } from 'src/services/api.service';

const programmingPlanKindFieldsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findPlanKindFieldConfigs: builder.query<
      PlanKindFieldConfig[],
      { programmingPlanId: string; kind: ProgrammingPlanKind }
    >({
      query: ({ programmingPlanId, kind }) =>
        `/programming-plans/${programmingPlanId}/kinds/${kind}/specific-data-fields`
    })
  })
});

export const { useFindPlanKindFieldConfigsQuery } =
  programmingPlanKindFieldsApi;
