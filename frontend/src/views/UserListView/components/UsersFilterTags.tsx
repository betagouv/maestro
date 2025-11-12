import Tag from '@codegouvfr/react-dsfr/Tag';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { Regions } from 'maestro-shared/referential/Region';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { UserRoleLabels } from 'maestro-shared/schema/User/UserRole';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import { FindUserOptions } from './UsersFilters';

type FilterableProp = keyof Omit<FindUserOptions, 'label'>;

const filtersConfig = {
  role: {
    prop: 'role',
    getLabel: (value) => UserRoleLabels[value]
  },
  region: {
    prop: 'region',
    getLabel: (value) => Regions[value].name
  },
  department: {
    prop: 'department',
    getLabel: (value) => DepartmentLabels[value]
  },
  programmingPlanKind: {
    prop: 'programmingPlanKind',
    getLabel: (value) => ProgrammingPlanKindLabels[value]
  }
} as const satisfies {
  [key in FilterableProp]: {
    prop: key;
  } & {
    getLabel: (value: NonNullable<FindUserOptions[key]>) => string | null;
  };
};
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
      {Object.values(filtersConfig).map((conf) => {
        const value = filters[conf.prop];

        if (value) {
          //@ts-expect-error TS2345
          const label = conf.getLabel(value);
          if (label) {
            return (
              <Tag
                key={conf.prop}
                dismissible
                nativeButtonProps={{
                  onClick: () => onChange({ [conf.prop]: null })
                }}
              >
                {label}
              </Tag>
            );
          }
        }
      })}
    </>
  );
};
