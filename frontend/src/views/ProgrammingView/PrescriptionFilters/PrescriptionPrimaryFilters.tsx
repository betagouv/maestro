import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import { t } from 'i18next';
import { uniq } from 'lodash-es';
import {
  Context,
  ContextLabels
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
import { useEffect, useMemo } from 'react';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import { PrescriptionFilters } from './PrescriptionFilters';

interface Props {
  programmingPlans: ProgrammingPlan[];
  filters: Partial<PrescriptionFilters>;
  onChange: (filters: Partial<PrescriptionFilters>) => void;
}

const PrescriptionPrimaryFilters = ({
  programmingPlans,
  filters,
  onChange
}: Props) => {
  const domainOptions = useMemo(
    () => uniq(programmingPlans.map((_) => _.domain)),
    [programmingPlans]
  );

  const programmingPlanOptions = useMemo(
    () =>
      programmingPlans.filter((plan) =>
        filters.domain ? plan.domain === filters.domain : true
      ),
    [filters, programmingPlans]
  );

  const programmingPlanKindOptions = useMemo(
    () =>
      uniq(
        programmingPlans
          .filter((plan) =>
            filters.domain ? plan.domain === filters.domain : true
          )
          .filter((plan) =>
            filters.planIds ? filters.planIds.includes(plan.id) : true
          )
          .flatMap((plan) => plan.kinds)
      ),
    [filters, programmingPlans]
  );

  const contextOptions = useMemo(
    () =>
      uniq(
        programmingPlans
          .filter((plan) =>
            filters.domain ? plan.domain === filters.domain : true
          )
          .filter((plan) =>
            filters.planIds ? filters.planIds.includes(plan.id) : true
          )
          .flatMap((plan) => plan.contexts)
      ),
    [filters, programmingPlans]
  );

  useEffect(
    () => {
      if (domainOptions.length === 1 && !filters.domain) {
        onChange({ domain: domainOptions[0] });
      }
      if (programmingPlanOptions.length === 1 && !filters.planIds?.length) {
        onChange({ planIds: [programmingPlanOptions[0].id] });
      }
      if (programmingPlanKindOptions.length === 1 && !filters.kinds?.length) {
        onChange({ kinds: [programmingPlanKindOptions[0]] });
      }
      if (contextOptions.length === 1 && !filters.contexts?.length) {
        onChange({ contexts: [contextOptions[0]] });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      domainOptions,
      programmingPlanOptions,
      programmingPlanKindOptions,
      contextOptions,
      filters
    ]
  );

  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <Select
          label="Domaine"
          nativeSelectProps={{
            value: filters.domain || '',
            onChange: (e) =>
              onChange({ domain: e.target.value as ProgrammingPlanDomain })
          }}
        >
          {selectOptionsFromList(domainOptions, {
            labels: ProgrammingPlanDomainLabels,
            withDefault: domainOptions.length > 1,
            withSort: true
          }).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <Select
          label="Plan"
          nativeSelectProps={{
            value: filters.planIds?.[0] ?? '',
            onChange: (e) =>
              onChange({
                planIds: [...(filters.planIds ?? []), e.target.value]
              })
          }}
        >
          {programmingPlanOptions.length > 1 && (
            <option value="">
              {filters.planIds?.length
                ? t('plan', {
                    count: filters.planIds?.length
                  })
                : 'Tous'}
            </option>
          )}
          {programmingPlanOptions
            .filter(
              (plan) =>
                programmingPlanOptions.length === 1 ||
                !filters.planIds?.includes(plan.id)
            )
            .map((plan) => (
              <option key={`plan-${plan.id}`} value={plan.id}>
                {plan.title}
              </option>
            ))}
        </Select>
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <Select
          label="Sous-plan"
          nativeSelectProps={{
            value: filters.kinds?.[0] ?? '',
            onChange: (e) =>
              onChange({
                kinds: [
                  ...(filters.kinds ?? []),
                  e.target.value as ProgrammingPlanKind
                ]
              })
          }}
        >
          {programmingPlanKindOptions.length > 1 && (
            <option value="">
              {filters.kinds?.length
                ? t('plan', {
                    count: filters.kinds?.length
                  })
                : 'Tous'}
            </option>
          )}
          {programmingPlanKindOptions
            .filter(
              (kind) =>
                programmingPlanKindOptions.length === 1 ||
                !filters.kinds?.includes(kind)
            )
            .map((kind) => (
              <option key={`kind-${kind}`} value={kind}>
                {ProgrammingPlanKindLabels[kind]}
              </option>
            ))}
        </Select>
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <Select
          label="Contexte"
          nativeSelectProps={{
            value: filters.contexts?.[0] ?? '',
            onChange: (e) =>
              onChange({
                contexts: [
                  ...(filters.contexts ?? []),
                  e.target.value as Context
                ]
              })
          }}
        >
          {contextOptions.length > 1 && (
            <option value="">
              {filters.contexts?.length
                ? t('context', {
                    count: filters.contexts?.length
                  })
                : 'Tous'}
            </option>
          )}
          {contextOptions
            .filter(
              (context) =>
                contextOptions.length === 1 ||
                !filters.contexts?.includes(context)
            )
            .map((context) => (
              <option key={`context-${context}`} value={context}>
                {ContextLabels[context]}
              </option>
            ))}
        </Select>
      </div>
    </div>
  );
};

export default PrescriptionPrimaryFilters;
