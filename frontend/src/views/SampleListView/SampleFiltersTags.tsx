import Tag from '@codegouvfr/react-dsfr/Tag';
import { format } from 'date-fns';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
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
import { useMemo } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';

interface Props {
  filters: Partial<FindSampleOptions>;
  onChange: (filters: Partial<FindSampleOptions>) => void;
  samplers?: User[];
}

const filtersConfig = {
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
    getLabel: (value) => Regions[value].name,
    getNewValue: () => ({ region: undefined, department: undefined })
  },
  departments: {
    prop: 'departments',
    getLabel: (value) =>
      value.length === 1
        ? DepartmentLabels[value[0]]
        : `${value.length} départements`
  },
  context: {
    prop: 'context',
    getLabel: (value) => ContextLabels[value]
  },
  compliance: {
    prop: 'compliance',
    getLabel: (value) => SampleComplianceLabels[value]
  }
} as const satisfies {
  [key in keyof Omit<
    FindSampleOptions,
    keyof Pagination | 'programmingPlanId' | 'reference'
  >]: {
    prop: key;
    getLabel: (
      value: NonNullable<FindSampleOptions[key]>,
      sampler: User
    ) => string | null;
    getNewValue?: () => Partial<FindSampleOptions>;
  };
};

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
          // @ts-expect-error TS2345 il est perdu
          const label = conf.getLabel(value, sampler);
          if (label) {
            return (
              <Tag
                key={conf.prop}
                dismissible
                nativeButtonProps={{
                  onClick: () =>
                    onChange(
                      'getNewValue' in conf
                        ? conf.getNewValue()
                        : { [conf.prop]: undefined }
                    )
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

export default SampleFiltersTags;
