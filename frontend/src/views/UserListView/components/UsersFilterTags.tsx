import Tag from '@codegouvfr/react-dsfr/Tag';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { Regions } from 'maestro-shared/referential/Region';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
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
      {filters.programmingPlanKinds?.map((kind) => (
        <Tag
          key={`programmingPlanKind-${kind}`}
          dismissible
          nativeButtonProps={{
            onClick: () =>
              onChange({
                programmingPlanKinds: filters.programmingPlanKinds!.filter(
                  (k) => k !== kind
                )
              })
          }}
        >
          {ProgrammingPlanKindLabels[kind]}
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
    </>
  );
};
