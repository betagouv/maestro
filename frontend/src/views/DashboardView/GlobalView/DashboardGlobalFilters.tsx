import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { sortBy, uniq } from 'lodash-es';
import {
  type Department,
  DepartmentLabels
} from 'maestro-shared/referential/Department';
import {
  type Region,
  RegionList,
  Regions
} from 'maestro-shared/referential/Region';
import { type Stage, StageLabels } from 'maestro-shared/referential/Stage';
import {
  type MatrixKind,
  matrixKindLabel
} from 'maestro-shared/schema/Matrix/MatrixReferential';
import type { ProgrammingPlanDomainId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { stagesFromSubPlans } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { getSubPlanMatrixKinds } from 'maestro-shared/schema/ProgrammingPlan/SubPlanMatrices';
import { useContext, useMemo } from 'react';
import AppCheckboxSelect from 'src/components/_app/AppCheckboxSelect/AppCheckboxSelect';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useMatrixReferential } from 'src/hooks/useMatrixReferential';
import { ApiClientContext } from 'src/services/apiClient';

export type DashboardFilters = {
  programmingPlanDomainIds: ProgrammingPlanDomainId[];
  programmingPlanIds: string[];
  regions: Region[];
  departments: Department[];
  companySirets: string[];
  matrixKinds: MatrixKind[];
  stages: Stage[];
};

export const emptyDashboardFilters: DashboardFilters = {
  programmingPlanDomainIds: [],
  programmingPlanIds: [],
  regions: [],
  departments: [],
  companySirets: [],
  matrixKinds: [],
  stages: []
};

type Props = {
  programmingPlans: ProgrammingPlanChecked[];
  filters: DashboardFilters;
  onChange: (filters: Partial<DashboardFilters>) => void;
};

const filterClassName = cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3');

const DashboardGlobalFilters = ({
  programmingPlans,
  filters,
  onChange
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { user, hasNationalView, hasRegionalView, hasRole } =
    useAuthentication();
  const matrixReferential = useMatrixReferential();

  const isDepartmentalCoordination = hasRole(
    'DepartmentalCoordinator',
    'DepartmentalObserver'
  );
  const isSampler = hasRole('Sampler');

  const { data: allDomains } = apiClient.useFindProgrammingPlanDomainsQuery();

  const { data: departmentCompanies } = apiClient.useFindCompaniesQuery(
    {
      region: user?.region,
      department: user?.department,
      kinds: ['MEAT_SLAUGHTERHOUSE', 'POULTRY_SLAUGHTERHOUSE']
    },
    { skip: !isDepartmentalCoordination }
  );

  const domainOptions = useMemo(() => {
    const planDomainIds = uniq(programmingPlans.map((plan) => plan.domainId));
    return sortBy(
      (allDomains ?? [])
        .filter((domain) => planDomainIds.includes(domain.id))
        .map((domain) => ({ label: domain.label, value: domain.id })),
      'label'
    );
  }, [allDomains, programmingPlans]);

  const planOptions = useMemo(
    () =>
      sortBy(
        programmingPlans
          .filter(
            (plan) =>
              filters.programmingPlanDomainIds.length === 0 ||
              filters.programmingPlanDomainIds.includes(plan.domainId)
          )
          .map((plan) => ({ label: plan.title, value: plan.id })),
        'label'
      ),
    [programmingPlans, filters.programmingPlanDomainIds]
  );

  const regionOptions = useMemo(
    () =>
      hasNationalView
        ? RegionList.map((region) => ({
            label: Regions[region].name,
            value: region
          }))
        : [],
    [hasNationalView]
  );

  const departmentOptions = useMemo(
    () =>
      hasRegionalView && user?.region
        ? Regions[user.region].departments.map((department) => ({
            label: DepartmentLabels[department],
            value: department
          }))
        : [],
    [hasRegionalView, user?.region]
  );

  const companyOptions = useMemo(() => {
    const companies = isDepartmentalCoordination
      ? (departmentCompanies ?? [])
      : isSampler
        ? (user?.companies ?? [])
        : [];
    return sortBy(
      companies.map((company) => ({
        label: company.name,
        value: company.siret
      })),
      'label'
    );
  }, [isDepartmentalCoordination, isSampler, departmentCompanies, user]);

  const matrixKindOptions = useMemo(
    () =>
      isDepartmentalCoordination || isSampler
        ? sortBy(
            uniq(
              programmingPlans
                .flatMap((plan) => plan.subPlans)
                .flatMap((subPlan) => getSubPlanMatrixKinds(subPlan.matrices))
            ).map((matrixKind) => ({
              label: matrixKindLabel(matrixReferential, matrixKind),
              value: matrixKind
            })),
            'label'
          )
        : [],
    [isDepartmentalCoordination, isSampler, programmingPlans, matrixReferential]
  );

  const stageOptions = useMemo(
    () =>
      sortBy(
        stagesFromSubPlans(
          programmingPlans.flatMap((plan) => plan.subPlans)
        ).map((stage) => ({ label: StageLabels[stage], value: stage })),
        'label'
      ),
    [programmingPlans]
  );

  const filterElements = [
    {
      key: 'domains',
      label: 'Domaines',
      options: domainOptions,
      selectedValues: filters.programmingPlanDomainIds,
      onChange: (programmingPlanDomainIds: ProgrammingPlanDomainId[]) =>
        onChange({ programmingPlanDomainIds, programmingPlanIds: [] })
    },
    {
      key: 'plans',
      label: 'Plans',
      options: planOptions,
      selectedValues: filters.programmingPlanIds,
      searchable: true,
      onChange: (programmingPlanIds: string[]) =>
        onChange({ programmingPlanIds })
    },
    {
      key: 'regions',
      label: 'Régions',
      emptyLabel: 'Toutes',
      options: regionOptions,
      selectedValues: filters.regions,
      onChange: (regions: Region[]) => onChange({ regions })
    },
    {
      key: 'departments',
      label: 'Départements',
      options: departmentOptions,
      selectedValues: filters.departments,
      onChange: (departments: Department[]) => onChange({ departments })
    },
    {
      key: 'companies',
      label: 'Abattoirs',
      options: companyOptions,
      selectedValues: filters.companySirets,
      onChange: (companySirets: string[]) => onChange({ companySirets })
    },
    {
      key: 'matrixKinds',
      label: 'Espèces / produits',
      options: matrixKindOptions,
      selectedValues: filters.matrixKinds,
      searchable: true,
      onChange: (matrixKinds: MatrixKind[]) => onChange({ matrixKinds })
    },
    {
      key: 'stages',
      label: 'Stades de prélèvement',
      options: stageOptions,
      selectedValues: filters.stages,
      onChange: (stages: Stage[]) => onChange({ stages })
    }
  ].filter((filter) => filter.options.length > 0);

  if (filterElements.length === 0) {
    return null;
  }

  return (
    <div
      className={clsx(
        'white-container',
        cx('fr-px-3w', 'fr-py-2w', 'fr-mb-3w')
      )}
    >
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        {filterElements.map((filter) => (
          <div className={filterClassName} key={filter.key}>
            <AppCheckboxSelect
              label={filter.label}
              options={filter.options as { label: string; value: string }[]}
              selectedValues={filter.selectedValues}
              onChange={filter.onChange as (values: string[]) => void}
              emptyLabel={filter.emptyLabel}
              searchable={filter.searchable}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardGlobalFilters;
