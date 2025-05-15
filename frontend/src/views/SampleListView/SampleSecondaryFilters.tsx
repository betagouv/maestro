import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import {
  Department,
  DepartmentLabels,
  DepartmentList
} from 'maestro-shared/referential/Department';
import { Region, RegionList, Regions } from 'maestro-shared/referential/Region';
import {
  Context,
  ContextLabels,
  ContextList
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import { FindSampleOptions, SampleCompliance } from 'maestro-shared/schema/Sample/FindSampleOptions';
import { useMemo } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { z } from 'zod';

interface Props {
  filters: Partial<FindSampleOptions>;
  onChange: (filters: Partial<FindSampleOptions>) => void;
}

const SampleSecondaryFilters = ({ filters, onChange }: Props) => {
  const { hasNationalView, user } = useAuthentication();

  const departmentOptions = useMemo(() => {
    const region = hasNationalView ? filters.region : user?.region;
    return region ? Regions[region as Region].departments : DepartmentList;
  }, [hasNationalView, user?.region, filters.region]);

  const borderingDepartments = useMemo(() => {
    const region = hasNationalView ? filters.region : user?.region;
    return region
      ? (Regions[region as Region].borderingDepartments?.sort((a, b) =>
          a.localeCompare(b)
        ) ?? [])
      : [];
  }, [hasNationalView, user?.region, filters.region]);

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
                  department: undefined
                })
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
                department: e.target.value as Department
              })
          }}
        >
          <optgroup>
            <option value="">Tous</option>
            {departmentOptions.map((department) => (
              <option key={`department-${department}`} value={department}>
                {`${department} - ${DepartmentLabels[department]}`}
              </option>
            ))}
          </optgroup>
          <optgroup label={'Départements limitrophes'}>
            {borderingDepartments.map((department) => (
              <option key={`department-${department}`} value={department}>
                {`${department} - ${DepartmentLabels[department]}`}
              </option>
            ))}
          </optgroup>
        </Select>
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
        <Select
          label="Contexte"
          nativeSelectProps={{
            value: filters.context || '',
            onChange: (e) =>
              onChange({
                context: e.target.value as Context,
                matrix: undefined
              })
          }}
        >
          <option value="">Tous</option>
          {ContextList.map((context) => (
            <option key={`context-${context}`} value={context}>
              {ContextLabels[context]}
            </option>
          ))}
        </Select>
      </div>
      <div className={cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3')}>
        <Select
          label="Conformité"
          nativeSelectProps={{
            value: filters.compliance || '',
            onChange: (e) =>
              onChange({
                compliance: e.target.value as z.infer<typeof SampleCompliance>
              })
          }}
        >
          <option value="">Tous</option>
          <option value='conform'>Conforme</option>
          <option value='notConform'>Non conforme</option>
        </Select>
      </div>
    </div>
  );
};

export default SampleSecondaryFilters;
