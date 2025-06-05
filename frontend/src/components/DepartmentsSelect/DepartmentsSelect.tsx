import Select from '@codegouvfr/react-dsfr/Select';
import { t } from 'i18next';
import {
  Department,
  DepartmentLabels,
  DepartmentList
} from 'maestro-shared/referential/Department';
import { Region, Regions } from 'maestro-shared/referential/Region';
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import { FunctionComponent, useMemo } from 'react';
import { assert, type Equals } from 'tsafe';
import { useAuthentication } from '../../hooks/useAuthentication';

type Props = {
  id: string;
  filters: Partial<FindSampleOptions>;
  onSelect: (department: Department) => void;
};

export const DepartmentsSelect: FunctionComponent<Props> = ({
  id,
  filters,
  onSelect,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { hasNationalView, user } = useAuthentication();

  const departmentOptions = useMemo(() => {
    const region = hasNationalView ? filters.region : user?.region;
    const list = region
      ? Regions[region as Region].departments
      : DepartmentList;

    return list
      .filter((l) => !filters.departments?.includes(l))
      .sort((a, b) => a.localeCompare(b));
  }, [hasNationalView, user?.region, filters.region, filters.departments]);

  const borderingDepartments = useMemo(() => {
    const region = hasNationalView ? filters.region : user?.region;
    const list = region
      ? (Regions[region as Region].borderingDepartments?.sort((a, b) =>
          a.localeCompare(b)
        ) ?? [])
      : [];
    return list.filter((l) => !filters.departments?.includes(l));
  }, [hasNationalView, user?.region, filters.region, filters.departments]);

  return (
    <Select
      label="Département"
      nativeSelectProps={{
        value: '',
        onChange: (e) => onSelect(e.target.value as Department)
      }}
    >
      <option value="">
        {filters.departments?.length
          ? t('department', {
              count: filters.departments?.length
            })
          : 'Tous'}
      </option>
      {borderingDepartments.length ? (
        <>
          <optgroup label={'Mes départements'}>
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
        </>
      ) : (
        departmentOptions.map((department) => (
          <option key={`department-${department}`} value={department}>
            {`${department} - ${DepartmentLabels[department]}`}
          </option>
        ))
      )}
    </Select>
  );
};
