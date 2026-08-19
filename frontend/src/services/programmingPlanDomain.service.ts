import { buildTypedQuery } from 'src/services/api.builder';
import { api } from 'src/services/api.service';

const programmingPlanDomainApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findProgrammingPlanDomains: buildTypedQuery(
      builder,
      '/programming-plan-domains',
      {
        providesTags: () => ['ProgrammingPlanDomain']
      }
    )
  })
});

export const { useFindProgrammingPlanDomainsQuery } = programmingPlanDomainApi;
