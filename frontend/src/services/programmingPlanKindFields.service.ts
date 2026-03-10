import { PlanKindFieldConfig } from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { api } from 'src/services/api.service';

const programmingPlanKindFieldsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findPlanKindFieldConfigs: builder.query<
      PlanKindFieldConfig[],
      ProgrammingPlanKind
    >({
      query: (kind) => `/programming-plan-kinds/${kind}/specific-data-fields`
    })
  })
});

export const { useFindPlanKindFieldConfigsQuery } =
  programmingPlanKindFieldsApi;
