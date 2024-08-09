import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import { useMemo } from 'react';
import {
  Department,
  DepartmentLabels,
  DepartmentList,
} from 'shared/referential/Department';
import { Region, RegionList, Regions } from 'shared/referential/Region';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { FindSampleOptions } from 'shared/schema/Sample/FindSampleOptions';
import { useAuthentication } from 'src/hooks/useAuthentication';

interface Props {
  filters: FindSampleOptions;
  onChange: (filters: FindSampleOptions) => void;
  programmingPlans?: ProgrammingPlan[];
}

const SampleSecondaryFilters = ({
  filters,
  onChange,
  programmingPlans,
}: Props) => {
  const { hasNationalView, userInfos } = useAuthentication();

  const departmentOptions = useMemo(() => {
    const region = userInfos?.region ?? filters.region;
    return region ? Regions[region as Region].departments : DepartmentList;
  }, [userInfos?.region, filters.region]);

  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      {hasNationalView && (
        <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
          <Select
            label="Région"
            nativeSelectProps={{
              value: filters.region || '',
              onChange: (e) =>
                onChange({
                  region: e.target.value as Region,
                  department: undefined,
                }),
            }}
          >
            <option value="">Toutes les régions</option>
            {RegionList.map((region) => (
              <option key={`region-${region}`} value={region}>
                {Regions[region].name}
              </option>
            ))}
          </Select>
        </div>
      )}
      <div className={cx('fr-col-12', 'fr-col-md-3')}>
        <Select
          label="Département"
          nativeSelectProps={{
            value: filters.department || '',
            onChange: (e) =>
              onChange({
                department: e.target.value as Department,
              }),
          }}
        >
          <option value="">Tous</option>
          {departmentOptions.map((department) => (
            <option key={`department-${department}`} value={department}>
              {`${department} - ${DepartmentLabels[department]}`}
            </option>
          ))}
        </Select>
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
        <Select
          label="Contexte"
          nativeSelectProps={{
            value: filters.programmingPlanId || '',
            onChange: (e) =>
              onChange({
                programmingPlanId: e.target.value,
                matrix: undefined,
              }),
          }}
        >
          <option value="">Tous</option>
          {programmingPlans?.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.title}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default SampleSecondaryFilters;
