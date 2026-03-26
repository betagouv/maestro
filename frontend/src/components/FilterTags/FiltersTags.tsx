import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { format } from 'date-fns';
import { omit } from 'lodash-es';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { Regions } from 'maestro-shared/referential/Region';
import type { Pagination } from 'maestro-shared/schema/commons/Pagination';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import {
  ContextLabels,
  type ProgrammingPlanContext
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanDomainLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  type FindSampleOptions,
  SampleComplianceLabels
} from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  DraftStatusList,
  RealizedStatusList,
  type SampleStatus,
  SampleStatusLabels
} from 'maestro-shared/schema/Sample/SampleStatus';
import type { UserRefined } from 'maestro-shared/schema/User/User';
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import { Fragment, type ReactNode, useMemo } from 'react';
import { useAuthentication } from 'src/hooks/useAuthentication';
import type { PrescriptionFilters } from '../../store/reducers/prescriptionsSlice';

type FilterableType = FindSampleOptions &
  Omit<
    PrescriptionFilters,
    | 'year'
    | 'missingSlaughterhouse'
    | 'missingLaboratory'
    | 'matrixQuery'
    | 'programmingPlanId'
  >;

interface Props {
  title?: string;
  filters: Partial<FilterableType>;
  onChange: (filters: Partial<FilterableType>) => void;
  samplers?: UserRefined[];
  programmingPlans?: ProgrammingPlanChecked[];
  laboratories?: Pick<Laboratory, 'id' | 'name'>[];
}

const tagProps = {
  dismissible: true,
  small: true,
  className: clsx(cx('fr-mb-1v'), 'align-left')
};

type FilterableProp = keyof Omit<
  FilterableType,
  keyof Pagination | 'reference' | 'companySirets'
>;

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
  laboratoryId: {
    prop: 'laboratoryId',
    getLabel: (value, { laboratories }) =>
      laboratories?.find(({ id }) => id === value)?.name ?? ''
  },
  programmingPlanIds: {
    prop: 'programmingPlanIds',
    getComponent: (value, onChange, { programmingPlans }) => (
      <Fragment key={`tag-programmingPlanIds`}>
        {value.map((id) => (
          <Tag
            {...tagProps}
            key={`tag-programmingPlanId-${id}`}
            nativeButtonProps={{
              onClick: () =>
                onChange({ programmingPlanIds: value.filter((v) => v !== id) })
            }}
          >
            {programmingPlans?.find((plan) => plan.id === id)?.title ?? id}
          </Tag>
        ))}
      </Fragment>
    )
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
  }
} as const satisfies {
  [key in FilterableProp]: {
    prop: key;
  } & (
    | {
        getLabel: (
          value: NonNullable<FilterableType[key]>,
          data: {
            sampler?: UserRefined;
            laboratories?: Props['laboratories'];
          }
        ) => string | null;
        getComponent?: never;
      }
    | {
        getComponent: (
          value: NonNullable<FilterableType[key]>,
          onChange: (filters: Partial<FilterableType>) => void,
          data: {
            programmingPlans?: ProgrammingPlanChecked[];
          }
        ) => ReactNode;
        getLabel?: never;
      }
  );
};

const FiltersTags = ({
  title,
  filters,
  onChange,
  samplers,
  programmingPlans,
  laboratories
}: Props) => {
  const { hasNationalView } = useAuthentication();
  const sampler = useMemo(
    () => samplers?.find((user) => user.id === filters.sampledBy),
    [samplers, filters.sampledBy]
  );

  const hasFilters = useMemo(
    () =>
      Object.values(
        omit(filters, 'region', 'page', 'perPage', 'programmingPlanIds')
      ).some((value) => isDefinedAndNotNull(value) && value !== '') ||
      ((programmingPlans ?? []).length > 1 &&
        (filters.programmingPlanIds ?? []).length > 0) ||
      (filters.region && hasNationalView),
    [filters, hasNationalView, programmingPlans]
  );

  if (!hasFilters) {
    return null;
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
              return conf.getComponent(value, onChange, {
                programmingPlans
              });
            } else {
              // @ts-expect-error TS2345 il est perdu
              const label = conf.getLabel(value, {
                sampler,
                laboratories
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
          return null;
        })}
      </div>
    </div>
  );
};

export default FiltersTags;
