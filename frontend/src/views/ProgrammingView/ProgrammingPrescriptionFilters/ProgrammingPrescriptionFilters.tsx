import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
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

interface Props {
  options: {
    plans: ProgrammingPlanChecked[];
    programmingSubPlanIds: ProgrammingSubPlanId[];
    contexts: ProgrammingPlanContext[];
  };
  programmingPlans?: ProgrammingPlanChecked[];
  filters: PrescriptionFilters;
  onChange: (filters: Partial<PrescriptionFilters>) => void;
  renderMode: 'inline' | 'modal';
  multiSelect?: boolean;
}

const ProgrammingPrescriptionFilters = ({
  options,
  filters,
  onChange,
  renderMode,
  multiSelect
}: Props) => {
  const filterClassName = useMemo(
    () =>
      cx('fr-col-12', renderMode === 'inline' ? 'fr-col-md-4' : 'fr-col-md-6'),
    [renderMode]
  );

  const subPlanLabelById = useMemo(() => {
    const map: Record<string, string> = {};
    options.plans.forEach((plan) => {
      plan.subPlans.forEach((sp) => {
        map[sp.id] = sp.label ?? sp.codeNat;
      });
    });
    return map;
  }, [options.plans]);

  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      <div className={filterClassName}>
        <Select
          label="Plan"
          nativeSelectProps={{
            value: filters.programmingPlanId ?? '',
            onChange: (e) =>
              onChange({
                programmingPlanId: e.target.value as string
              })
          }}
          className={cx('fr-mb-1v')}
          disabled={options.plans.length <= 1}
        >
          {options.plans.length > 1 && (
            <option value="">Sélectionner une valeur</option>
          )}
          {options.plans.map((plan) => (
            <option key={`plan-${plan.id}`} value={plan.id}>
              {plan.title}
            </option>
          ))}
        </Select>
      </div>
      <div className={filterClassName}>
        <Select
          label="Sous-plan"
          nativeSelectProps={{
            value: filters.programmingSubPlanIds?.[0] ?? '',
            onChange: (e) =>
              onChange({
                programmingSubPlanIds: multiSelect
                  ? [
                      ...(filters.programmingSubPlanIds ?? []),
                      e.target.value as ProgrammingSubPlanId
                    ]
                  : [e.target.value as ProgrammingSubPlanId]
              })
          }}
          className={cx('fr-mb-1v')}
          disabled={options.programmingSubPlanIds.length <= 1}
        >
          {options.programmingSubPlanIds.length > 1 && (
            <option value="">
              {multiSelect && filters.programmingSubPlanIds?.length
                ? t('select', {
                    count: filters.programmingSubPlanIds?.length
                  })
                : multiSelect
                  ? 'Tous'
                  : 'Sélectionner une valeur'}
            </option>
          )}
          {options.programmingSubPlanIds
            .filter(
              (kind) =>
                options.programmingSubPlanIds.length === 1 ||
                !multiSelect ||
                !filters.programmingSubPlanIds?.includes(
                  kind as ProgrammingSubPlanId
                )
            )
            .map((kind) => (
              <option key={`kind-${kind}`} value={kind}>
                {subPlanLabelById[kind] ?? kind}
              </option>
            ))}
        </Select>
        {multiSelect && options.programmingSubPlanIds.length > 1 && (
          <FiltersTags
            filters={pick(filters, ['programmingSubPlanIds'])}
            onChange={({ programmingSubPlanIds }) =>
              onChange({ programmingSubPlanIds })
            }
          />
        )}
      </div>
      <div className={filterClassName}>
        <Select
          label="Contexte"
          nativeSelectProps={{
            value: filters.context ?? '',
            onChange: (e) =>
              onChange({
                context: e.target.value as ProgrammingPlanContext
              })
          }}
          className={cx('fr-mb-1v')}
          disabled={options.contexts.length <= 1}
        >
          {options.contexts.length > 1 && <option value="">Tous</option>}
          {options.contexts.map((context) => (
            <option key={`context-${context}`} value={context}>
              {ContextLabels[context]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default ProgrammingPrescriptionFilters;
