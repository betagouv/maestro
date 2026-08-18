import Tag from '@codegouvfr/react-dsfr/Tag';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { Regions } from 'maestro-shared/referential/Region';
import { StageLabels } from 'maestro-shared/referential/Stage';
import { UserRoleLabels } from 'maestro-shared/schema/User/UserRole';
import type { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import type { FindUserOptions } from './UsersFilters';

type Props = {
  filters: FindUserOptions;
  onChange: (filters: Partial<FindUserOptions>) => void;
};
export const UsersFilterTags: FunctionComponent<Props> = ({
  filters,
  onChange,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  return (
    <>
      {filters.regions?.map((region) => (
        <Tag
          key={`region-${region}`}
          dismissible
          nativeButtonProps={{
            onClick: () =>
              onChange({
                regions: filters.regions!.filter((r) => r !== region)
              })
          }}
        >
          {Regions[region].name}
        </Tag>
      ))}
      {filters.departments?.map((department) => (
        <Tag
          key={`department-${department}`}
          dismissible
          nativeButtonProps={{
            onClick: () =>
              onChange({
                departments: filters.departments!.filter(
                  (d) => d !== department
                )
              })
          }}
        >
          {DepartmentLabels[department]}
        </Tag>
      ))}
      {filters.roles?.map((role) => (
        <Tag
          key={`role-${role}`}
          dismissible
          nativeButtonProps={{
            onClick: () =>
              onChange({
                roles: filters.roles!.filter((r) => r !== role)
              })
          }}
        >
          {UserRoleLabels[role]}
        </Tag>
      ))}
      {filters.stages?.map((stage) => (
        <Tag
          key={`stage-${stage}`}
          dismissible
          nativeButtonProps={{
            onClick: () =>
              onChange({
                stages: filters.stages!.filter((s) => s !== stage)
              })
          }}
        >
          {StageLabels[stage]}
        </Tag>
      ))}
      {filters.onlyDisabled && (
        <Tag
          key="onlyDisabled"
          dismissible
          nativeButtonProps={{
            onClick: () => onChange({ onlyDisabled: null })
          }}
        >
          Seulement les désactivés
        </Tag>
      )}
      {filters.onlyUncertified && (
        <Tag
          key="onlyUncertified"
          dismissible
          nativeButtonProps={{
            onClick: () => onChange({ onlyUncertified: null })
          }}
        >
          Seulement les non formés
        </Tag>
      )}
    </>
  );
};
