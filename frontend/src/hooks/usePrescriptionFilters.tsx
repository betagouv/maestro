import { uniq } from 'lodash-es';
import { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useCallback, useMemo } from 'react';
import { PrescriptionFilters } from '../store/reducers/prescriptionsSlice';

export const usePrescriptionFilters = (
  programmingPlans?: ProgrammingPlanChecked[]
) => {
  const domainOptions = useMemo(
    () => uniq((programmingPlans ?? [])?.map((_) => _.domain)),
    [programmingPlans]
  );
  const yearOptions = useCallback(
    (filters: PrescriptionFilters) =>
      uniq(
        (programmingPlans ?? [])
          .filter((plan) => plan.domain === filters.domain)
          .map((plan) => plan.year)
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

      const domain = domainOptions.some(
        (domainOption) => domainOption === aggregatedFilters?.domain
      )
        ? aggregatedFilters?.domain
        : getUniqOrUndefined(domainOptions)?.[0];
      const year = domain
        ? yearOptions({ domain }).some(
            (yearOption) => yearOption === aggregatedFilters?.year
          )
          ? aggregatedFilters?.year
          : getUniqOrUndefined(yearOptions({ domain }))?.[0]
        : undefined;

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
        year,
        programmingPlanId,
        kinds,
        context
      };
    },
    [
      domainOptions,
      yearOptions,
      programmingPlanOptions,
      programmingPlanKindOptions,
      contextOptions
    ]
  );

  return {
    domainOptions,
    yearOptions,
    programmingPlanOptions,
    programmingPlanKindOptions,
    contextOptions,
    reduceFilters
  };
};
