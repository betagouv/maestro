import Tag from '@codegouvfr/react-dsfr/Tag';
import { format } from 'date-fns';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { Regions } from 'maestro-shared/referential/Region';
import { Pagination } from 'maestro-shared/schema/commons/Pagination';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import {
  FindSampleOptions,
  SampleComplianceLabels
} from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  DraftStatusList,
  RealizedStatusList,
  SampleStatus,
  SampleStatusLabels
} from 'maestro-shared/schema/Sample/SampleStatus';
import { User } from 'maestro-shared/schema/User/User';
import { ReactNode, useMemo } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';

interface Props {
  filters: Partial<FindSampleOptions>;
  onChange: (filters: Partial<FindSampleOptions>) => void;
  samplers?: User[];
}

const filtersConfig = {
  matrixKind: {
    prop: 'matrixKind',
    getLabel: (value) => MatrixKindLabels[value]
  },
  matrix: {
    prop: 'matrix',
    getLabel: (value) => MatrixLabels[value]
  },
  status: {
    prop: 'status',
    getLabel: (value) =>
      value === DraftStatusList.join(',')
        ? 'Brouillon'
        : value === RealizedStatusList.join(',')
          ? 'Réalisé'
          : SampleStatusLabels[value as SampleStatus]
  },
  sampledBy: {
    prop: 'sampledBy',
    getLabel: (_value, sampler) =>
      sampler ? `${sampler.firstName} ${sampler.lastName}` : null
  },
  sampledAt: {
    prop: 'sampledAt',
    getLabel: (value) => format(new Date(value), 'dd/MM/yyyy')
  },
  region: {
    prop: 'region',
    getComponent: (value, onChange) => (
      <Tag
        key={`tag-region`}
        dismissible
        nativeButtonProps={{
          onClick: () => onChange({ region: undefined, departments: undefined })
        }}
      >
        {Regions[value].name}
      </Tag>
    )
  },
  departments: {
    prop: 'departments',
    getComponent: (value, onChange) => (
      <>
        {value.map((d) => (
          <Tag
            key={`tag-department-${d}`}
            dismissible
            nativeButtonProps={{
              onClick: () =>
                onChange({ departments: value.filter((v) => v !== d) })
            }}
          >
            {DepartmentLabels[d]}
          </Tag>
        ))}
      </>
    )
  },
  contexts: {
    prop: 'contexts',
    getComponent: (value, onChange) => (
      <>
        {value.map((d) => (
          <Tag
            key={`tag-context-${d}`}
            dismissible
            nativeButtonProps={{
              onClick: () =>
                onChange({ contexts: value.filter((v) => v !== d) })
            }}
          >
            {ContextLabels[d]}
          </Tag>
        ))}
      </>
    )
  },
  compliance: {
    prop: 'compliance',
    getLabel: (value) => SampleComplianceLabels[value]
  },
  withAtLeastOneResidue: {
    prop: 'withAtLeastOneResidue',
    getLabel: () => 'Avec au moins un résidu'
  }
} as const satisfies {
  [key in FilterableProp]: {
    prop: key;
  } & (
    | {
        getLabel: (
          value: NonNullable<FindSampleOptions[key]>,
          sampler: User
        ) => string | null;
        getComponent?: never;
      }
    | {
        getComponent: (
          value: NonNullable<FindSampleOptions[key]>,
          onChange: (filters: Partial<FindSampleOptions>) => void
        ) => ReactNode;
        getLabel?: never;
      }
  );
};
type FilterableProp = keyof Omit<
  FindSampleOptions,
  keyof Pagination | 'programmingPlanId' | 'reference'
>;
const SampleFiltersTags = ({ filters, onChange, samplers }: Props) => {
  const { hasNationalView } = useAuthentication();
  const sampler = useMemo(
    () => samplers?.find((user) => user.id === filters.sampledBy),
    [samplers, filters.sampledBy]
  );

  return (
    <>
      {Object.values(filtersConfig).map((conf) => {
        const value = filters[conf.prop];

        if (value && (hasNationalView || conf.prop !== 'region')) {
          if ('getComponent' in conf) {
            // @ts-expect-error TS2345 il est perdu
            return conf.getComponent(value, onChange);
          } else {
            // @ts-expect-error TS2345 il est perdu
            const label = conf.getLabel(value, sampler);
            if (label) {
              return (
                <Tag
                  key={conf.prop}
                  dismissible
                  nativeButtonProps={{
                    onClick: () => onChange({ [conf.prop]: undefined })
                  }}
                >
                  {label}
                </Tag>
              );
            }
          }
        }
      })}
    </>
  );
};

export default SampleFiltersTags;
