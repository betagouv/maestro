import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import { t } from 'i18next';
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
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import { PrescriptionFilters } from '../../../store/reducers/prescriptionsSlice';

interface Props {
  options: {
    domains: ProgrammingPlanDomain[];
    plans: ProgrammingPlan[];
    kinds: ProgrammingPlanKind[];
    contexts: ProgrammingPlanContext[];
  };
  filters: Partial<PrescriptionFilters>;
  onChange: (filters: Partial<PrescriptionFilters>) => void;
}

const PrescriptionPrimaryFilters = ({ options, filters, onChange }: Props) => {
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
          disabled={options.domains.length <= 1}
        >
          {selectOptionsFromList(options.domains, {
            labels: ProgrammingPlanDomainLabels,
            withDefault: options.domains.length > 1,
            withSort: true,
            defaultLabel: 'Tous'
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
          disabled={options.plans.length <= 1}
        >
          {options.plans.length > 1 && (
            <option value="">
              {filters.planIds?.length
                ? t('plan', {
                    count: filters.planIds?.length
                  })
                : 'Tous'}
            </option>
          )}
          {options.plans
            .filter(
              (plan) =>
                options.plans.length === 1 ||
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
          disabled={options.kinds.length <= 1}
        >
          {options.kinds.length > 1 && (
            <option value="">
              {filters.kinds?.length
                ? t('plan', {
                    count: filters.kinds?.length
                  })
                : 'Tous'}
            </option>
          )}
          {options.kinds
            .filter(
              (kind) =>
                options.kinds.length === 1 || !filters.kinds?.includes(kind)
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
                  e.target.value as ProgrammingPlanContext
                ]
              })
          }}
          disabled={options.contexts.length <= 1}
        >
          {options.contexts.length > 1 && (
            <option value="">
              {filters.contexts?.length
                ? t('context', {
                    count: filters.contexts?.length
                  })
                : 'Tous'}
            </option>
          )}
          {options.contexts
            .filter(
              (context) =>
                options.contexts.length === 1 ||
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
