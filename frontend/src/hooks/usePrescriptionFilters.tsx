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
          .filter(
            (plan) =>
              !filters.programmingPlanId ||
              plan.id === filters.programmingPlanId
          )
          .flatMap((plan) => plan.kinds)
      ),
    [programmingPlanOptions]
  );
  const contextOptions = useCallback(
    (filters: PrescriptionFilters) =>
      uniq(
        programmingPlanOptions(filters)
          .filter(
            (plan) =>
              !filters.programmingPlanId ||
              plan.id === filters.programmingPlanId
          )
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

      const { year } = aggregatedFilters;
      const domain = domainOptions({ year }).some(
        (domainOption) => domainOption === aggregatedFilters?.domain
      )
        ? aggregatedFilters?.domain
        : getUniqOrUndefined(domainOptions({ year }))?.[0];
      const programmingPlanId = programmingPlanOptions({ year, domain }).some(
        (planOption) => planOption.id === aggregatedFilters?.programmingPlanId
      )
        ? aggregatedFilters?.programmingPlanId
        : getUniqOrUndefined(programmingPlanOptions({ year, domain }))?.[0]?.id;
      const kinds =
        aggregatedFilters?.kinds?.filter((kind) =>
          programmingPlanKindOptions({
            year,
            domain,
            programmingPlanId
          }).some((kindOption) => kind === kindOption)
        ) ??
        getUniqOrUndefined(
          programmingPlanKindOptions({
            year,
            domain,
            programmingPlanId
          })
        );
      const context = contextOptions({
        year,
        domain,
        programmingPlanId,
        kinds
      }).some((contextOption) => aggregatedFilters?.context === contextOption)
        ? aggregatedFilters?.context
        : getUniqOrUndefined(
            contextOptions({
              year,
              domain,
              programmingPlanId,
              kinds
            })
          )?.[0];

      return {
        ...aggregatedFilters,
        domain,
        programmingPlanId,
        kinds,
        context
      };
    },
    [
      domainOptions,
      programmingPlanOptions,
      programmingPlanKindOptions,
      contextOptions
    ]
  );

  return {
    domainOptions,
    programmingPlanOptions,
    programmingPlanKindOptions,
    contextOptions,
    reduceFilters
  };
};
