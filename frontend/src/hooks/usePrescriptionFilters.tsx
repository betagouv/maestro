import { uniq } from 'lodash-es';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useCallback, useMemo } from 'react';
import type { PrescriptionFilters } from '../store/reducers/prescriptionsSlice';

export const usePrescriptionFilters = (
  programmingPlans?: ProgrammingPlanChecked[]
) => {
  const yearOptions = useMemo(
    () => uniq((programmingPlans ?? []).map((plan) => plan.year)),
    [programmingPlans]
  );
  const programmingPlanOptions = useCallback(
    (filters: PrescriptionFilters) =>
      (programmingPlans ?? []).filter((plan) => plan.year === filters.year),
    [programmingPlans]
  );
  const programmingSubPlanOptions = useCallback(
    (filters: PrescriptionFilters) =>
      uniq(
        programmingPlanOptions(filters)
          .filter(
            (plan) =>
              !filters.programmingPlanIds?.length ||
              filters.programmingPlanIds.includes(plan.id)
          )
          .flatMap((plan) => plan.subPlans.map((sp) => sp.id))
      ),
    [programmingPlanOptions]
  );
  const contextOptions = useCallback(
    (filters: PrescriptionFilters) =>
      uniq(
        programmingPlanOptions(filters)
          .filter(
            (plan) =>
              !filters.programmingPlanIds?.length ||
              filters.programmingPlanIds.includes(plan.id)
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

      const year = yearOptions.some(
        (yearOption) => yearOption === aggregatedFilters?.year
      )
        ? aggregatedFilters?.year
        : getUniqOrUndefined(yearOptions)?.[0];

      const availableProgrammingPlanIds = programmingPlanOptions({ year }).map(
        (plan) => plan.id
      );
      const programmingPlanIds =
        aggregatedFilters?.programmingPlanIds?.filter((programmingPlanId) =>
          availableProgrammingPlanIds.includes(programmingPlanId)
        ) ?? getUniqOrUndefined(availableProgrammingPlanIds);
      const availableProgrammingSubPlanIds = programmingSubPlanOptions({
        year,
        programmingPlanIds
      });
      const programmingSubPlanIds =
        aggregatedFilters?.programmingSubPlanIds?.filter((kind) =>
          availableProgrammingSubPlanIds.some(
            (kindOption) => kind === kindOption
          )
        ) ?? getUniqOrUndefined(availableProgrammingSubPlanIds);
      const availableContexts = contextOptions({
        year,
        programmingPlanIds,
        programmingSubPlanIds
      });
      const contexts =
        aggregatedFilters?.contexts?.filter((context) =>
          availableContexts.some((contextOption) => context === contextOption)
        ) ?? getUniqOrUndefined(availableContexts);

      return {
        ...aggregatedFilters,
        year,
        programmingPlanIds,
        programmingSubPlanIds,
        contexts
      };
    },
    [
      yearOptions,
      programmingPlanOptions,
      programmingSubPlanOptions,
      contextOptions
    ]
  );

  return {
    yearOptions,
    programmingPlanOptions,
    programmingSubPlanOptions,
    contextOptions,
    reduceFilters
  };
};
