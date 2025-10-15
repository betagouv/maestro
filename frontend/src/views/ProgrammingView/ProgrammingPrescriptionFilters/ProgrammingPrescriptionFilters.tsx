import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import { t } from 'i18next';
import { pick } from 'lodash-es';
import {
  ContextLabels,
  ProgrammingPlanContext
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  ProgrammingPlanDomain,
  ProgrammingPlanDomainLabels
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import {
  ProgrammingPlanKind,
  ProgrammingPlanKindLabels
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useMemo } from 'react';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import FiltersTags from '../../../components/FilterTags/FiltersTags';
import { PrescriptionFilters } from '../../../store/reducers/prescriptionsSlice';

interface Props {
  options: {
    domains: ProgrammingPlanDomain[];
    plans: ProgrammingPlan[];
    kinds: ProgrammingPlanKind[];
    contexts: ProgrammingPlanContext[];
  };
  programmingPlans?: ProgrammingPlan[];
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
      cx(
        'fr-col-12',
        renderMode === 'inline'
          ? options.domains.length > 1
            ? 'fr-col-md-3'
            : 'fr-col-md-4'
          : 'fr-col-md-6'
      ),
    [renderMode, options.domains.length]
  );

  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      {options.domains.length > 1 && (
        <div className={filterClassName}>
          <Select
            label="Domaine"
            nativeSelectProps={{
              value: filters.domain || '',
              onChange: (e) =>
                onChange({ domain: e.target.value as ProgrammingPlanDomain })
            }}
            className={cx('fr-mb-1v')}
            disabled={options.domains.length <= 1}
          >
            {selectOptionsFromList(options.domains, {
              labels: ProgrammingPlanDomainLabels,
              withDefault: options.domains.length > 1,
              withSort: true,
              defaultLabel: 'Sélectionner une valeur'
            }).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      )}
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
            value: filters.kinds?.[0] ?? '',
            onChange: (e) =>
              onChange({
                kinds: multiSelect
                  ? [
                      ...(filters.kinds ?? []),
                      e.target.value as ProgrammingPlanKind
                    ]
                  : [e.target.value as ProgrammingPlanKind]
              })
          }}
          className={cx('fr-mb-1v')}
          disabled={options.kinds.length <= 1}
        >
          {options.kinds.length > 1 && (
            <option value="">
              {multiSelect && filters.kinds?.length
                ? t('select', {
                    count: filters.kinds?.length
                  })
                : multiSelect
                  ? 'Tous'
                  : 'Sélectionner une valeur'}
            </option>
          )}
          {options.kinds
            .filter(
              (kind) =>
                options.kinds.length === 1 ||
                !multiSelect ||
                !filters.kinds?.includes(kind)
            )
            .map((kind) => (
              <option key={`kind-${kind}`} value={kind}>
                {ProgrammingPlanKindLabels[kind]}
              </option>
            ))}
        </Select>
        {multiSelect && options.kinds.length > 1 && (
          <FiltersTags
            filters={pick(filters, ['kinds'])}
            onChange={({ kinds }) => onChange({ kinds })}
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
