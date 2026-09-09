import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { sortBy } from 'lodash-es';
import type { ProgrammingPlanDomain } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { UserListItem } from 'maestro-shared/schema/User/User';
import AppCheckboxSelect from '../../../components/_app/AppCheckboxSelect/AppCheckboxSelect';
import { useAuthentication } from '../../../hooks/useAuthentication';
import useWindowSize from '../../../hooks/useWindowSize';

export interface TrackingFilters {
  programmingPlanDomainIds: string[];
  programmingPlanIds: string[];
  coordinatorIds: string[];
  launchStatuses: string[];
  settingsStatuses: string[];
  nationalStatuses: string[];
  regionalStatuses: string[];
  departmentalStatuses: string[];
}

export const emptyTrackingFilters: TrackingFilters = {
  programmingPlanDomainIds: [],
  programmingPlanIds: [],
  coordinatorIds: [],
  launchStatuses: [],
  settingsStatuses: [],
  nationalStatuses: [],
  regionalStatuses: [],
  departmentalStatuses: []
};

export const LaunchStatusLabels = {
  Launched: 'Plans lancés',
  NotLaunched: 'Plans en attente de lancement'
} as const;

export const SettingsStatusLabels = {
  Completed: 'Paramétrage terminé',
  NotCompleted: 'Paramétrage non terminé'
} as const;

interface Props {
  filters: TrackingFilters;
  onChange: (filters: TrackingFilters) => void;
  options: {
    domains: ProgrammingPlanDomain[];
    plans: ProgrammingPlanChecked[];
    coordinators: UserListItem[];
    nationalStatuses: string[];
    regionalStatuses: string[];
    departmentalStatuses: string[];
  };
  isExpanded: boolean;
  onToggleExpanded: () => void;
  region?: string;
  department?: string;
}

const filterClassName = cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3');

const ProgrammingPlanTrackingFilters = ({
  filters,
  onChange,
  options,
  isExpanded,
  onToggleExpanded,
  region,
  department
}: Props) => {
  const { isMobile } = useWindowSize();
  const { hasRole } = useAuthentication();

  const canFilterByCoordinator = hasRole(
    'AdministratorMaestro',
    'AdministratorBGIR'
  );
  const canFilterBySettings = !region;
  const canFilterByNationalStatus = !region;
  const canFilterByRegionalStatus = !department;

  const change = (patch: Partial<TrackingFilters>) =>
    onChange({ ...filters, ...patch });

  const statusOptions = (labels: string[]) =>
    labels.map((label) => ({ label, value: label }));

  const activeTags = (
    [
      {
        key: 'programmingPlanDomainIds' as const,
        label: (id: string) =>
          options.domains.find((domain) => domain.id === id)?.label
      },
      {
        key: 'programmingPlanIds' as const,
        label: (id: string) =>
          options.plans.find((plan) => plan.id === id)?.title
      },
      {
        key: 'coordinatorIds' as const,
        label: (id: string) => {
          const coordinator = options.coordinators.find((_) => _.id === id);
          return coordinator?.name ?? coordinator?.email;
        }
      },
      { key: 'launchStatuses' as const, label: (value: string) => value },
      { key: 'settingsStatuses' as const, label: (value: string) => value },
      { key: 'nationalStatuses' as const, label: (value: string) => value },
      { key: 'regionalStatuses' as const, label: (value: string) => value },
      { key: 'departmentalStatuses' as const, label: (value: string) => value }
    ] as const
  ).flatMap(({ key, label }) =>
    filters[key].map((value) => ({ key, value, label: label(value) }))
  );

  const primaryFilters = (
    <>
      <div className={filterClassName}>
        <AppCheckboxSelect
          label="Domaines"
          options={sortBy(
            options.domains.map((domain) => ({
              label: domain.label,
              value: domain.id
            })),
            'label'
          )}
          selectedValues={filters.programmingPlanDomainIds}
          onChange={(programmingPlanDomainIds) =>
            change({ programmingPlanDomainIds })
          }
          summaryLabel="domaine"
          searchable
          disabled={options.domains.length === 0}
        />
      </div>
      <div className={filterClassName}>
        <AppCheckboxSelect
          label="Plans"
          options={sortBy(
            options.plans.map((plan) => ({
              label: plan.title,
              value: plan.id
            })),
            'label'
          )}
          selectedValues={filters.programmingPlanIds}
          onChange={(programmingPlanIds) => change({ programmingPlanIds })}
          summaryLabel="plan"
          searchable
          disabled={options.plans.length === 0}
        />
      </div>
      {canFilterByCoordinator && (
        <div className={filterClassName}>
          <AppCheckboxSelect
            label="Coordinateurs"
            options={sortBy(
              options.coordinators.map((coordinator) => ({
                label: coordinator.name ?? coordinator.email,
                value: coordinator.id
              })),
              'label'
            )}
            selectedValues={filters.coordinatorIds}
            onChange={(coordinatorIds) => change({ coordinatorIds })}
            summaryLabel="coordinateur"
            searchable
            disabled={options.coordinators.length === 0}
          />
        </div>
      )}
      <div className={filterClassName}>
        <AppCheckboxSelect
          label="Lancement"
          options={Object.values(LaunchStatusLabels).map((label) => ({
            label,
            value: label
          }))}
          selectedValues={filters.launchStatuses}
          onChange={(launchStatuses) => change({ launchStatuses })}
          summaryLabel="statut"
        />
      </div>
    </>
  );

  const secondaryFilters = (
    <>
      {canFilterBySettings && (
        <div className={filterClassName}>
          <AppCheckboxSelect
            label="Paramétrage"
            options={Object.values(SettingsStatusLabels).map((label) => ({
              label,
              value: label
            }))}
            selectedValues={filters.settingsStatuses}
            onChange={(settingsStatuses) => change({ settingsStatuses })}
            summaryLabel="statut"
          />
        </div>
      )}
      {canFilterByNationalStatus && (
        <div className={filterClassName}>
          <AppCheckboxSelect
            label="Statuts BGIR"
            options={statusOptions(options.nationalStatuses)}
            selectedValues={filters.nationalStatuses}
            onChange={(nationalStatuses) => change({ nationalStatuses })}
            summaryLabel="statut"
            disabled={options.nationalStatuses.length === 0}
          />
        </div>
      )}
      {canFilterByRegionalStatus && (
        <div className={filterClassName}>
          <AppCheckboxSelect
            label="Statuts région"
            options={statusOptions(options.regionalStatuses)}
            selectedValues={filters.regionalStatuses}
            onChange={(regionalStatuses) => change({ regionalStatuses })}
            summaryLabel="statut"
            disabled={options.regionalStatuses.length === 0}
          />
        </div>
      )}
      <div className={filterClassName}>
        <AppCheckboxSelect
          label="Statuts département"
          options={statusOptions(options.departmentalStatuses)}
          selectedValues={filters.departmentalStatuses}
          onChange={(departmentalStatuses) => change({ departmentalStatuses })}
          summaryLabel="statut"
          disabled={options.departmentalStatuses.length === 0}
        />
      </div>
    </>
  );

  const activeFilters = activeTags.length > 0 && (
    <div
      className={clsx('d-flex-align-start')}
      style={{ flexDirection: 'column' }}
    >
      <span
        className={cx('fr-text--light', 'fr-text--sm', 'fr-mb-0', 'fr-mt-3w')}
      >
        Filtres actifs
      </span>
      <div className={cx('fr-mt-1v')}>
        {activeTags.map(({ key, value, label }) =>
          label ? (
            <Tag
              dismissible
              small
              className={clsx(cx('fr-mb-1v'), 'align-left')}
              key={`tag-${key}-${value}`}
              nativeButtonProps={{
                onClick: () =>
                  change({
                    [key]: filters[key].filter((_) => _ !== value)
                  } as Partial<TrackingFilters>)
              }}
            >
              {label}
            </Tag>
          ) : null
        )}
      </div>
    </div>
  );

  return (
    <div className={cx('fr-container', 'fr-px-5w', 'fr-mb-3w')}>
      <div className={clsx(cx('fr-px-4w', 'fr-py-3w'), 'white-container')}>
        <div className="d-flex-align-start">
          <div className="flex-grow-1">
            <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
              {primaryFilters}
              {(isExpanded || isMobile) && secondaryFilters}
            </div>
            {activeFilters}
          </div>
          {!isMobile && (
            <Button
              onClick={onToggleExpanded}
              priority="secondary"
              className={cx('fr-ml-3w', 'fr-mt-4w')}
            >
              {isExpanded ? 'Moins de filtres' : 'Plus de filtres'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgrammingPlanTrackingFilters;
