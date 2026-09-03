import Accordion from '@codegouvfr/react-dsfr/Accordion';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { pick, sortBy } from 'lodash-es';
import {
  type Matrix,
  MatrixList
} from 'maestro-shared/referential/Matrix/Matrix';
import type { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import type { Stage } from 'maestro-shared/referential/Stage';
import { StageLabels } from 'maestro-shared/referential/Stage';
import {
  ContextLabels,
  type ProgrammingPlanContext,
  ProgrammingPlanContextList
} from 'maestro-shared/schema/ProgrammingPlan/Context';
import type { ProgrammingPlanDomainId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { useContext, useMemo, useState } from 'react';
import AppCheckboxSelect from '../../../components/_app/AppCheckboxSelect/AppCheckboxSelect';
import FiltersTags from '../../../components/FilterTags/FiltersTags';
import { useAuthentication } from '../../../hooks/useAuthentication';
import useWindowSize from '../../../hooks/useWindowSize';
import { ApiClientContext } from '../../../services/apiClient';
import type { PrescriptionFilters } from '../../../store/reducers/prescriptionsSlice';
import './ProgrammingPrescriptionFilters.scss';

interface Props {
  options: {
    plans: ProgrammingPlanChecked[];
    programmingSubPlanIds: ProgrammingSubPlanId[];
    matrixKinds: MatrixKind[];
    contexts: ProgrammingPlanContext[];
  };
  stageCounts: { stage: Stage; count: number }[];
  filters: PrescriptionFilters;
  onChange: (filters: Partial<PrescriptionFilters>) => void;
}

const filterClassName = cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3');

const ProgrammingPrescriptionFilters = ({
  options,
  stageCounts,
  filters,
  onChange
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { isMobile } = useWindowSize();
  const { hasRole, hasDepartmentalView } = useAuthentication();
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const canFilterByCoordinator = hasRole(
    'AdministratorMaestro',
    'AdministratorBGIR'
  );

  const { data: allDomains } = apiClient.useFindProgrammingPlanDomainsQuery();
  const { data: coordinators } = apiClient.useFindUsersQuery(
    { roles: ['NationalCoordinator'], disabled: false },
    { skip: !canFilterByCoordinator }
  );
  const { data: laboratories } = apiClient.useFindLaboratoriesQuery(
    { programmingPlanIds: options.plans.map((plan) => plan.id) },
    { skip: !hasDepartmentalView || options.plans.length === 0 }
  );

  const subPlans = useMemo(
    () => options.plans.flatMap((plan) => plan.subPlans),
    [options.plans]
  );

  const domains = useMemo(
    () => (allDomains ?? []).filter((domain) => domain.year === filters.year),
    [allDomains, filters.year]
  );

  const matrixOptions = useMemo(() => {
    const availableMatrices = new Set(
      options.matrixKinds.flatMap((kind) => MatrixListByKind[kind])
    );
    return sortBy(
      MatrixList.filter((matrix) => availableMatrices.has(matrix)).map(
        (matrix) => ({ label: MatrixLabels[matrix], value: matrix })
      ),
      'label'
    );
  }, [options.matrixKinds]);

  const contextValues = [
    ...(filters.contexts ?? []),
    ...(filters.outsideProgrammingPlan ? ['OutsideProgrammingPlan'] : [])
  ];

  const stageTags = (
    <div className={clsx(cx('fr-mb-3w'), 'programming-filters-stages')}>
      <Tag
        nativeButtonProps={{ onClick: () => onChange({ stage: undefined }) }}
        pressed={!filters.stage}
        small
      >
        Tous
      </Tag>
      {stageCounts.map(({ stage, count }) => (
        <Tag
          key={`stage-${stage}`}
          nativeButtonProps={{ onClick: () => onChange({ stage }) }}
          pressed={filters.stage === stage}
          small
        >
          {`${StageLabels[stage]} (${count})`}
        </Tag>
      ))}
    </div>
  );

  const primaryFilters = (
    <>
      <div className={filterClassName}>
        <AppCheckboxSelect
          label="N° de sous-plan"
          options={sortBy(
            options.programmingSubPlanIds.map((subPlanId) => {
              const subPlan = subPlans.find((_) => _.id === subPlanId);
              return {
                label: subPlan
                  ? `${subPlan.subPlanNumber} - ${subPlan.label}`
                  : subPlanId,
                value: subPlanId
              };
            }),
            'label'
          )}
          selectedValues={filters.programmingSubPlanIds ?? []}
          onChange={(programmingSubPlanIds) =>
            onChange({ programmingSubPlanIds })
          }
          summaryLabel="sous-plan"
          searchable
          disabled={options.programmingSubPlanIds.length <= 1}
        />
      </div>
      <div className={filterClassName}>
        <AppCheckboxSelect
          label="Domaines"
          options={domains.map((domain) => ({
            label: domain.label,
            value: domain.id
          }))}
          selectedValues={filters.programmingPlanDomainIds ?? []}
          onChange={(programmingPlanDomainIds) =>
            onChange({
              programmingPlanDomainIds:
                programmingPlanDomainIds as ProgrammingPlanDomainId[]
            })
          }
          summaryLabel="domaine"
          searchable
          disabled={domains.length === 0}
        />
      </div>
      <div className={filterClassName}>
        <AppCheckboxSelect
          label="Plans"
          options={options.plans.map((plan) => ({
            label: plan.title,
            value: plan.id
          }))}
          selectedValues={filters.programmingPlanIds ?? []}
          onChange={(programmingPlanIds) => onChange({ programmingPlanIds })}
          summaryLabel="plan"
          searchable
          disabled={options.plans.length <= 1}
        />
      </div>
      <div className={filterClassName}>
        <AppCheckboxSelect
          label="Matrices"
          options={matrixOptions}
          selectedValues={filters.matrices ?? []}
          onChange={(matrices) => onChange({ matrices: matrices as Matrix[] })}
          emptyLabel="Toutes"
          summaryLabel="matrice"
          searchable
          disabled={matrixOptions.length === 0}
        />
      </div>
    </>
  );

  const secondaryFilters = (
    <>
      <div className={filterClassName}>
        <AppCheckboxSelect
          label="Contexte"
          options={[
            ...ProgrammingPlanContextList.filter((context) =>
              options.contexts.includes(context)
            ).map((context) => ({
              label: ContextLabels[context],
              value: context as string
            })),
            { label: 'Hors programmation', value: 'OutsideProgrammingPlan' }
          ]}
          selectedValues={contextValues}
          onChange={(values) =>
            onChange({
              contexts: values.filter(
                (value) => value !== 'OutsideProgrammingPlan'
              ) as ProgrammingPlanContext[],
              outsideProgrammingPlan: values.includes('OutsideProgrammingPlan')
                ? true
                : undefined
            })
          }
          summaryLabel="contexte"
        />
      </div>
      {canFilterByCoordinator && (
        <div className={filterClassName}>
          <AppCheckboxSelect
            label="Coordinateur·ices"
            options={sortBy(
              (coordinators ?? []).map((coordinator) => ({
                label: coordinator.name ?? coordinator.email,
                value: coordinator.id
              })),
              'label'
            )}
            selectedValues={filters.coordinatorIds ?? []}
            onChange={(coordinatorIds) => onChange({ coordinatorIds })}
            summaryLabel="coordinateur"
            searchable
            disabled={(coordinators ?? []).length === 0}
          />
        </div>
      )}
      {hasDepartmentalView && (
        <div className={filterClassName}>
          <AppCheckboxSelect
            label="Laboratoires"
            options={sortBy(
              (laboratories ?? []).map((laboratory) => ({
                label: laboratory.name,
                value: laboratory.id
              })),
              'label'
            )}
            selectedValues={filters.laboratoryIds ?? []}
            onChange={(laboratoryIds) => onChange({ laboratoryIds })}
            summaryLabel="laboratoire"
            searchable
            disabled={(laboratories ?? []).length === 0}
          />
        </div>
      )}
    </>
  );

  const activeFilters = (
    <FiltersTags
      title="Filtres actifs"
      filters={pick(filters, [
        'programmingPlanIds',
        'programmingSubPlanIds',
        'programmingPlanDomainIds',
        'matrices',
        'contexts',
        'outsideProgrammingPlan',
        'coordinatorIds',
        'laboratoryIds'
      ])}
      programmingPlans={options.plans}
      domains={domains}
      users={coordinators}
      laboratories={laboratories}
      onChange={(changedFilters) =>
        onChange(
          pick(changedFilters, [
            'programmingPlanIds',
            'programmingSubPlanIds',
            'programmingPlanDomainIds',
            'matrices',
            'contexts',
            'outsideProgrammingPlan',
            'coordinatorIds',
            'laboratoryIds'
          ]) as Partial<PrescriptionFilters>
        )
      }
    />
  );

  if (isMobile) {
    return (
      <div className={cx('fr-container', 'fr-mb-3w')}>
        {stageTags}
        <Accordion label="Filtrer les résultats">
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            {primaryFilters}
            {secondaryFilters}
          </div>
          {activeFilters}
        </Accordion>
      </div>
    );
  }

  return (
    <div className={cx('fr-container', 'fr-px-5w', 'fr-mb-3w')}>
      <div className={clsx(cx('fr-px-4w', 'fr-py-3w'), 'white-container')}>
        {stageTags}
        <div className="d-flex-align-start">
          <div className="flex-grow-1">
            <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
              {primaryFilters}
              {isFilterExpanded && secondaryFilters}
            </div>
            {activeFilters}
          </div>
          <Button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            priority="secondary"
            className={cx('fr-ml-3w', 'fr-mt-4w')}
          >
            {isFilterExpanded ? 'Moins de filtres' : 'Plus de filtres'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgrammingPrescriptionFilters;
