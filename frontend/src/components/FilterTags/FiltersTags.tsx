import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { format } from 'date-fns';
import { omit } from 'lodash-es';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import { Regions } from 'maestro-shared/referential/Region';
import type { Pagination } from 'maestro-shared/schema/commons/Pagination';
import type { Laboratory } from 'maestro-shared/schema/Laboratory/Laboratory';
import { ContextLabels } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlanDomainLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanKindLabels } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import { SampleComplianceLabels } from 'maestro-shared/schema/Sample/SampleCompliance';
import { SampleStatusLabels } from 'maestro-shared/schema/Sample/SampleStatus';
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
  keyof Pagination | 'reference' | 'companySirets' | 'prescriptionId'
>;

const renderArrayTags = <T extends string>(
  filterKey: string,
  value: T[],
  getLabel: (item: T) => string,
  onChange: (filters: Partial<FilterableType>) => void,
  extraChanges?: Partial<FilterableType>
): ReactNode => (
  <Fragment key={`tag-${filterKey}`}>
    {value.map((item) => (
      <Tag
        {...tagProps}
        key={`tag-${filterKey}-${item}`}
        nativeButtonProps={{
          onClick: () =>
            onChange({
              [filterKey]: value.filter((v) => v !== item),
              ...extraChanges
            } as Partial<FilterableType>)
        }}
      >
        {getLabel(item)}
      </Tag>
    ))}
  </Fragment>
);

const filtersConfig = {
  matrixKinds: {
    prop: 'matrixKinds',
    getComponent: (value, onChange, { filters }) => (
      <Fragment key="tag-matrixKinds">
        {value.map((kind) => (
          <Tag
            {...tagProps}
            key={`tag-matrixKind-${kind}`}
            nativeButtonProps={{
              onClick: () => {
                const newMatrixKinds = value.filter((v) => v !== kind);
                const remainingMatrices = filters?.matrices?.filter((m) =>
                  newMatrixKinds.some((k) => MatrixListByKind[k].includes(m))
                );
                onChange({
                  matrixKinds: newMatrixKinds,
                  matrices: remainingMatrices
                });
              }
            }}
          >
            {MatrixKindLabels[kind]}
          </Tag>
        ))}
      </Fragment>
    )
  },
  matrices: {
    prop: 'matrices',
    getComponent: (value, onChange) =>
      renderArrayTags('matrices', value, (m) => MatrixLabels[m], onChange)
  },
  statuses: {
    prop: 'statuses',
    getComponent: (value, onChange) =>
      renderArrayTags('statuses', value, (s) => SampleStatusLabels[s], onChange)
  },
  sampledBy: {
    prop: 'sampledBy',
    getComponent: (value, onChange, { samplers }) => (
      <Fragment key="tag-sampledBy">
        {value.map((id) => {
          const sampler = samplers?.find((u) => u.id === id);
          return sampler ? (
            <Tag
              {...tagProps}
              key={`tag-sampledBy-${id}`}
              nativeButtonProps={{
                onClick: () =>
                  onChange({ sampledBy: value.filter((v) => v !== id) })
              }}
            >
              {sampler.name}
            </Tag>
          ) : null;
        })}
      </Fragment>
    )
  },
  sampledDate: {
    prop: 'sampledDate',
    getLabel: (value) => format(new Date(value), 'dd/MM/yyyy')
  },
  regions: {
    prop: 'regions',
    getComponent: (value, onChange) =>
      renderArrayTags('regions', value, (r) => Regions[r].name, onChange, {
        departments: undefined
      })
  },
  departments: {
    prop: 'departments',
    getComponent: (value, onChange) =>
      renderArrayTags(
        'departments',
        value,
        (d) => DepartmentLabels[d],
        onChange
      )
  },
  contexts: {
    prop: 'contexts',
    getComponent: (value, onChange) =>
      renderArrayTags('contexts', value, (d) => ContextLabels[d], onChange)
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
  laboratoryIds: {
    prop: 'laboratoryIds',
    getComponent: (value, onChange, { laboratories }) => (
      <Fragment key="tag-laboratoryIds">
        {value.map((id) => {
          const lab = laboratories?.find((l) => l.id === id);
          return lab ? (
            <Tag
              {...tagProps}
              key={`tag-laboratory-${id}`}
              nativeButtonProps={{
                onClick: () =>
                  onChange({ laboratoryIds: value.filter((v) => v !== id) })
              }}
            >
              {lab.name}
            </Tag>
          ) : null;
        })}
      </Fragment>
    )
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
    getComponent: (value, onChange) =>
      renderArrayTags(
        'kinds',
        value,
        (d) => ProgrammingPlanKindLabels[d],
        onChange
      )
  }
} as const satisfies {
  [key in FilterableProp]: {
    prop: key;
  } & (
    | {
        getLabel: (
          value: NonNullable<FilterableType[key]>,
          data: Record<string, never>
        ) => string | null;
        getComponent?: never;
      }
    | {
        getComponent: (
          value: NonNullable<FilterableType[key]>,
          onChange: (filters: Partial<FilterableType>) => void,
          data: {
            programmingPlans?: ProgrammingPlanChecked[];
            samplers?: UserRefined[];
            laboratories?: Props['laboratories'];
            filters?: Partial<FilterableType>;
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

  const hasFilters = useMemo(
    () =>
      Object.values(
        omit(filters, 'regions', 'page', 'perPage', 'programmingPlanIds')
      ).some((value) => isDefinedAndNotNull(value) && value !== '') ||
      ((programmingPlans ?? []).length > 1 &&
        (filters.programmingPlanIds ?? []).length > 0) ||
      ((filters.regions ?? []).length > 0 && hasNationalView),
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

          if (
            isDefinedAndNotNull(value) &&
            (!Array.isArray(value) || value.length > 0) &&
            (hasNationalView || conf.prop !== 'regions')
          ) {
            if ('getComponent' in conf) {
              // @ts-expect-error TS2345 il est perdu
              return conf.getComponent(value, onChange, {
                programmingPlans,
                samplers,
                laboratories,
                filters
              });
            } else {
              // @ts-expect-error TS2345 il est perdu
              const label = conf.getLabel(value, {});
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
