import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import { t } from 'i18next';
import { uniq } from 'lodash-es';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { PrescriptionFilters } from './PrescriptionFilters';

interface Props {
  programmingPlans: ProgrammingPlan[];
  filters: Partial<PrescriptionFilters>;
  onChange: (filters: Partial<PrescriptionFilters>) => void;
}

const PrescriptionSecondaryFilters = ({
  programmingPlans,
  filters,
  onChange
}: Props) => {
  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <Select
          label="Matrice"
          nativeSelectProps={{
            value: '',
            onChange: (e) =>
              onChange({
                planIds: [...(filters.planIds ?? []), e.target.value]
              })
          }}
        >
          <option value="">
            {filters.planIds?.length
              ? t('plan', {
                  count: filters.planIds?.length
                })
              : 'Tous'}
          </option>
          {uniq(
            programmingPlans
              .filter((plan) =>
                filters.domain ? plan.domain === filters.domain : true
              )
              .filter((plan) => !filters.planIds?.includes(plan.id))
          ).map((plan) => (
            <option key={`matrix-${plan.id}`} value={plan.id}>
              {plan.title}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default PrescriptionSecondaryFilters;
