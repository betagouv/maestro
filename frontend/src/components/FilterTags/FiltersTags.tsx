import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { format } from 'date-fns';
import { omit } from 'lodash-es';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { Regions } from 'maestro-shared/referential/Region';
import { Pagination } from 'maestro-shared/schema/commons/Pagination';
import {
  ContextLabels,
  ProgrammingPlanContext
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanDomainLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
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
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import { Fragment, ReactNode, useMemo } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { PrescriptionFilters } from '../../store/reducers/prescriptionsSlice';

type FilterableType = FindSampleOptions & Omit<PrescriptionFilters, 'year'>;

interface Props {
  title?: string;
  filters: Partial<FilterableType>;
  onChange: (filters: Partial<FilterableType>) => void;
  samplers?: User[];
  programmingPlans?: ProgrammingPlan[];
}

const tagProps = {
  dismissible: true,
  small: true,
  className: clsx(cx('fr-mb-1v'), 'align-left')
};

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
    getLabel: (_value, { sampler }) => (sampler ? `${sampler.name}` : null)
  },
  sampledAt: {
    prop: 'sampledAt',
    getLabel: (value) => format(new Date(value), 'dd/MM/yyyy')
  },
  region: {
    prop: 'region',
    getComponent: (value, onChange) => (
      <Tag
        {...tagProps}
        key={`tag-region`}
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
            {...tagProps}
            key={`tag-department-${d}`}
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
      <Fragment key={`tag-contexts`}>
        {value.map((d) => (
          <Tag
            {...tagProps}
            key={`tag-context-${d}`}
            nativeButtonProps={{
              onClick: () =>
                onChange({
                  contexts: value.filter(
                    (v) => v !== d
                  ) as ProgrammingPlanContext[]
                })
            }}
          >
            {ContextLabels[d]}
          </Tag>
        ))}
      </Fragment>
    )
  },
  context: {
    prop: 'context',
    getLabel: (value) => ContextLabels[value]
  },
  compliance: {
    prop: 'compliance',
    getLabel: (value) => SampleComplianceLabels[value]
  },
  withAtLeastOneResidue: {
    prop: 'withAtLeastOneResidue',
    getLabel: () => 'Avec au moins un résidu'
  },
  domain: {
    prop: 'domain',
    getLabel: (value) => ProgrammingPlanDomainLabels[value]
  },
  kinds: {
    prop: 'kinds',
    getComponent: (value, onChange) => (
      <Fragment key={`tag-kinds`}>
        {value.map((d) => (
          <Tag
            {...tagProps}
            key={`tag-kind-${d}`}
            nativeButtonProps={{
              onClick: () => onChange({ kinds: value.filter((v) => v !== d) })
            }}
          >
            {ProgrammingPlanKindLabels[d]}
          </Tag>
        ))}
      </Fragment>
    )
  },
  planId: {
    prop: 'planId',
    getLabel: (_value, { programmingPlan }) => programmingPlan?.title || null
  }
} as const satisfies {
  [key in FilterableProp]: {
    prop: key;
  } & (
    | {
        getLabel: (
          value: NonNullable<FilterableType[key]>,
          data: {
            sampler?: User;
            programmingPlan?: ProgrammingPlan;
          }
        ) => string | null;
        getComponent?: never;
      }
    | {
        getComponent: (
          value: NonNullable<FilterableType[key]>,
          onChange: (filters: Partial<FilterableType>) => void
        ) => ReactNode;
        getLabel?: never;
      }
  );
};

type FilterableProp = keyof Omit<
  FilterableType,
  keyof Pagination | 'programmingPlanId' | 'reference'
>;
const FiltersTags = ({
  title,
  filters,
  onChange,
  samplers,
  programmingPlans
}: Props) => {
  const { hasNationalView } = useAuthentication();
  const sampler = useMemo(
    () => samplers?.find((user) => user.id === filters.sampledBy),
    [samplers, filters.sampledBy]
  );
  const programmingPlan = useMemo(
    () => programmingPlans?.find((plan) => filters.planId === plan.id),
    [programmingPlans, filters.planId]
  );

  const hasFilters = useMemo(
    () =>
      Object.values(omit(filters, 'region', 'page', 'perPage')).some(
        (value) => isDefinedAndNotNull(value) && value !== ''
      ) ||
      (filters.region && hasNationalView),
    [filters, hasNationalView]
  );

  if (!hasFilters) {
    return <></>;
  }

  return (
    <div
      className={clsx('d-flex-align-start')}
      style={{ flexDirection: 'column' }}
    >
      {title && (
        <span
          className={cx('fr-text--light', 'fr-text--sm', 'fr-mb-0', 'fr-mt-3w')}
        >
          {title}
        </span>
      )}
      <div className={cx('fr-mt-1v')}>
        {Object.values(filtersConfig).map((conf) => {
          const value = filters[conf.prop];

          if (value && (hasNationalView || conf.prop !== 'region')) {
            if ('getComponent' in conf) {
              // @ts-expect-error TS2345 il est perdu
              return conf.getComponent(value, onChange);
            } else {
              // @ts-expect-error TS2345 il est perdu
              const label = conf.getLabel(value, {
                sampler,
                programmingPlan: programmingPlan
              });
              if (label) {
                return (
                  <Tag
                    {...tagProps}
                    key={conf.prop}
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
      </div>
    </div>
  );
};

export default FiltersTags;
