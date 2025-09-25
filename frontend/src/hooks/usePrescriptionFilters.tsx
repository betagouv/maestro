import { uniq } from 'lodash-es';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useCallback } from 'react';
import { PrescriptionFilters } from '../store/reducers/prescriptionsSlice';

export const usePrescriptionFilters = (
  programmingPlans?: ProgrammingPlan[]
) => {
  const domainOptions = useCallback(
    (filters: { year: number }) =>
      uniq(
        (programmingPlans ?? [])
          .filter((plan) => plan.year === filters.year)
          ?.map((_) => _.domain)
      ),
    [programmingPlans]
  );
  const programmingPlanOptions = useCallback(
    (filters: PrescriptionFilters) =>
      (programmingPlans ?? []).filter(
        (plan) =>
          plan.year === filters.year &&
          (filters.domain ? plan.domain === filters.domain : true)
      ),
    [programmingPlans]
  );
  const programmingPlanKindOptions = useCallback(
    (filters: PrescriptionFilters) =>
      uniq(
        programmingPlanOptions(filters)
          .filter((plan) => (filters.planIds ?? [plan.id]).includes(plan.id))
          .flatMap((plan) => plan.kinds)
      ),
    [programmingPlanOptions]
  );
  const contextOptions = useCallback(
    (filters: PrescriptionFilters) =>
      uniq(
        programmingPlanOptions(filters)
          .filter((plan) => (filters.planIds ?? [plan.id]).includes(plan.id))
          .flatMap((plan) => plan.contexts)
      ),
    [programmingPlanOptions]
  );

  const reduceFilters = useCallback(
    (
      existingFilters: PrescriptionFilters,
      newFilters: Partial<PrescriptionFilters>
    ) => {
      const aggregatedFilters = {
        ...existingFilters,
        ...newFilters
      };

      const getUniqOrUndefined = <T,>(arr: T[]): T[] | undefined => {
        const uniqArr = uniq(arr);
        return uniqArr.length === 1 ? uniqArr : undefined;
      };

      const { year, domain } = aggregatedFilters;
      const planIds =
        aggregatedFilters?.planIds?.filter((id) =>
          programmingPlanOptions({ year, domain }).some(
            (planOption) => planOption.id === id
          )
        ) ??
        getUniqOrUndefined(programmingPlanOptions({ year, domain }))?.map(
          (_) => _.id
        );
      const kinds =
        aggregatedFilters?.kinds?.filter((kind) =>
          programmingPlanKindOptions({
            year,
            domain,
            planIds
          }).some((kindOption) => kind === kindOption)
        ) ??
        getUniqOrUndefined(
          programmingPlanKindOptions({
            year,
            domain,
            planIds
          })
        );
      const contexts =
        aggregatedFilters?.contexts?.filter((context) =>
          contextOptions({
            year,
            domain,
            planIds,
            kinds
          }).some((contextOption) => context === contextOption)
        ) ??
        getUniqOrUndefined(
          contextOptions({
            year,
            domain,
            planIds,
            kinds
          })
        );

      const reducedFilters = {
        ...aggregatedFilters,
        planIds,
        kinds,
        contexts
      };
      return reducedFilters;
    },
    [programmingPlanOptions, programmingPlanKindOptions, contextOptions]
  );

  return {
    domainOptions,
    programmingPlanOptions,
    programmingPlanKindOptions,
    contextOptions,
    reduceFilters
  };
};
