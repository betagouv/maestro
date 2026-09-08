import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import clsx from 'clsx';
import { t } from 'i18next';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import FiltersTags from '../../../components/FilterTags/FiltersTags';

interface Props {
  plans: ProgrammingPlanChecked[];
  selectedPlanIds: string[];
  onChange: (planIds: string[]) => void;
}

const ProgrammingPlanTrackingFilters = ({
  plans,
  selectedPlanIds,
  onChange
}: Props) => (
  <div className={cx('fr-container', 'fr-px-5w', 'fr-mb-3w')}>
    <div className={clsx(cx('fr-px-4w', 'fr-py-3w'), 'white-container')}>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-md-4')}>
          <Select
            label="Plan"
            nativeSelectProps={{
              value: '',
              onChange: (e) => onChange([...selectedPlanIds, e.target.value])
            }}
            className={cx('fr-mb-1v')}
            disabled={plans.length <= 1}
          >
            <option value="">
              {selectedPlanIds.length
                ? t('programmingPlan', { count: selectedPlanIds.length })
                : 'Tous'}
            </option>
            {plans
              .filter((plan) => !selectedPlanIds.includes(plan.id))
              .map((plan) => (
                <option key={`plan-${plan.id}`} value={plan.id}>
                  {plan.title}
                </option>
              ))}
          </Select>
          <FiltersTags
            filters={{ programmingPlanIds: selectedPlanIds }}
            programmingPlans={plans}
            onChange={(filters) => onChange(filters.programmingPlanIds ?? [])}
          />
        </div>
      </div>
    </div>
  </div>
);

export default ProgrammingPlanTrackingFilters;
