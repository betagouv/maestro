import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import clsx from 'clsx';
import { t } from 'i18next';
import { pick } from 'lodash-es';
import {
  ContextLabels,
  type ProgrammingPlanContext
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { useMemo } from 'react';
import FiltersTags from '../../../components/FilterTags/FiltersTags';
import type { PrescriptionFilters } from '../../../store/reducers/prescriptionsSlice';
import { pluralize } from '../../../utils/stringUtils';

interface Props {
  options: {
    plans: ProgrammingPlanChecked[];
    programmingSubPlanIds: ProgrammingSubPlanId[];
    contexts: ProgrammingPlanContext[];
  };
  filters: PrescriptionFilters;
  onChange: (filters: Partial<PrescriptionFilters>) => void;
  renderMode: 'inline' | 'modal';
}

const ProgrammingPrescriptionFilters = ({
  options,
  filters,
  onChange,
  renderMode
}: Props) => {
  const filterClassName = useMemo(
    () =>
      cx('fr-col-12', renderMode === 'inline' ? 'fr-col-md-4' : 'fr-col-md-6'),
    [renderMode]
  );

  return (
    <div className={cx('fr-container', 'fr-px-5w', 'fr-mb-3w')}>
      <div className={clsx(cx('fr-px-4w', 'fr-py-3w'), 'white-container')}>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={filterClassName}>
            <Select
              label="Plan"
              nativeSelectProps={{
                value: '',
                onChange: (e) =>
                  onChange({
                    programmingPlanIds: [
                      ...(filters.programmingPlanIds ?? []),
                      e.target.value as string
                    ]
                  })
              }}
              className={cx('fr-mb-1v')}
              disabled={options.plans.length <= 1}
            >
              <option value="">
                {filters.programmingPlanIds?.length
                  ? t('programmingPlan', {
                      count: filters.programmingPlanIds.length
                    })
                  : 'Tous'}
              </option>
              {options.plans
                .filter(
                  (plan) => !filters.programmingPlanIds?.includes(plan.id)
                )
                .map((plan) => (
                  <option key={`plan-${plan.id}`} value={plan.id}>
                    {plan.title}
                  </option>
                ))}
            </Select>
            <FiltersTags
              filters={pick(filters, 'programmingPlanIds')}
              programmingPlans={options.plans}
              onChange={({ programmingPlanIds }) =>
                onChange({ programmingPlanIds })
              }
            />
          </div>
          <div className={filterClassName}>
            <Select
              label="Sous-plan"
              nativeSelectProps={{
                value: '',
                onChange: (e) =>
                  onChange({
                    programmingSubPlanIds: [
                      ...(filters.programmingSubPlanIds ?? []),
                      e.target.value as ProgrammingSubPlanId
                    ]
                  })
              }}
              className={cx('fr-mb-1v')}
              disabled={options.programmingSubPlanIds.length <= 1}
            >
              <option value="">
                {filters.programmingSubPlanIds?.length
                  ? pluralize(filters.programmingSubPlanIds.length, {
                      preserveCount: true
                    })('sous-plan')
                  : 'Tous'}
              </option>
              {options.programmingSubPlanIds
                .filter(
                  (subPlanId) =>
                    !filters.programmingSubPlanIds?.includes(subPlanId)
                )
                .map((subPlanId) => (
                  <option key={`subPlanId-${subPlanId}`} value={subPlanId}>
                    {
                      options.plans
                        .flatMap((p) => p.subPlans)
                        .find((sp) => sp.id === subPlanId)?.label
                    }
                  </option>
                ))}
            </Select>
            <FiltersTags
              filters={pick(filters, 'programmingSubPlanIds')}
              programmingPlans={options.plans}
              onChange={({ programmingSubPlanIds }) =>
                onChange({ programmingSubPlanIds })
              }
            />
          </div>
          <div className={filterClassName}>
            <Select
              label="Contexte"
              nativeSelectProps={{
                value: '',
                onChange: (e) =>
                  onChange({
                    contexts: [
                      ...(filters.contexts ?? []),
                      e.target.value as ProgrammingPlanContext
                    ]
                  })
              }}
              className={cx('fr-mb-1v')}
              disabled={options.contexts.length <= 1}
            >
              <option value="">
                {filters.contexts?.length
                  ? t('context', {
                      count: filters.contexts.length
                    })
                  : 'Tous'}
              </option>
              {options.contexts
                .filter((context) => !filters.contexts?.includes(context))
                .map((context) => (
                  <option key={`context-${context}`} value={context}>
                    {ContextLabels[context]}
                  </option>
                ))}
            </Select>
            <FiltersTags
              filters={pick(filters, 'contexts')}
              onChange={({ contexts }) =>
                onChange({
                  contexts: contexts as ProgrammingPlanContext[] | undefined
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgrammingPrescriptionFilters;
