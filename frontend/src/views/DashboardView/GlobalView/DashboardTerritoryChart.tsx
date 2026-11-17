import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { DepartmentLabels } from 'maestro-shared/referential/Department';
import { Regions } from 'maestro-shared/referential/Region';
import type {
  DashboardStats,
  DashboardTerritoryLevel
} from 'maestro-shared/schema/Sample/DashboardStats';
import { realizedCount } from 'maestro-shared/schema/Sample/DashboardStats';
import { SampleStatusLabels } from 'maestro-shared/schema/Sample/SampleStatus';
import { type FunctionComponent, useContext, useMemo } from 'react';
import { ApiClientContext } from 'src/services/apiClient';
import './DashboardTerritoryChart.scss';

type Props = {
  stats: DashboardStats | undefined;
  territoryLevel: DashboardTerritoryLevel;
};

const series = [
  {
    key: 'completed',
    label: SampleStatusLabels.Completed,
    of: (counts: DashboardStats['countsByStatus']) => counts.Completed
  },
  {
    key: 'in-review',
    label: SampleStatusLabels.InReview,
    of: (counts: DashboardStats['countsByStatus']) => counts.InReview
  },
  {
    key: 'sent',
    label: SampleStatusLabels.Sent,
    of: (counts: DashboardStats['countsByStatus']) => counts.Sent
  },
  {
    key: 'analysis',
    label: SampleStatusLabels.Analysis,
    of: (counts: DashboardStats['countsByStatus']) => counts.Analysis
  },
  {
    key: 'submitted',
    label: SampleStatusLabels.Submitted,
    of: (counts: DashboardStats['countsByStatus']) => counts.Submitted
  }
];

const DashboardTerritoryChart: FunctionComponent<Props> = ({
  stats,
  territoryLevel
}) => {
  const apiClient = useContext(ApiClientContext);

  const { data: companies } = apiClient.useFindCompaniesQuery(
    {},
    { skip: territoryLevel !== 'Company' }
  );

  const territoryLabel = useMemo(() => {
    const companyNameBySiret = new Map(
      (companies ?? []).map((company) => [company.siret, company.name])
    );
    return (key: string) => {
      if (territoryLevel === 'Region') {
        return Regions[key as keyof typeof Regions]?.name ?? key;
      }
      if (territoryLevel === 'Department') {
        return DepartmentLabels[key as keyof typeof DepartmentLabels] ?? key;
      }
      return companyNameBySiret.get(key) ?? key;
    };
  }, [territoryLevel, companies]);

  const rows = useMemo(
    () =>
      (stats?.byTerritory ?? [])
        .map((territory) => {
          const realized = realizedCount(territory.countsByStatus);
          const submitted = territory.countsByStatus.Submitted;
          const done = realized + submitted;
          return {
            key: territory.key,
            label: territoryLabel(territory.key),
            countsByStatus: territory.countsByStatus,
            programmedCount: territory.programmedCount,
            done,
            scale: Math.max(territory.programmedCount, done),
            remaining: Math.max(0, territory.programmedCount - done),
            overflow: Math.max(0, done - territory.programmedCount)
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label)),
    [stats, territoryLabel]
  );

  const displayedSeries = useMemo(
    () =>
      series.filter((serie) =>
        rows.some((row) => serie.of(row.countsByStatus) > 0)
      ),
    [rows]
  );

  if (rows.length === 0) {
    return null;
  }

  const widthOf = (value: number, scale: number) =>
    scale === 0 ? '0%' : `${(value / scale) * 100}%`;

  const title =
    territoryLevel === 'Region'
      ? 'Avancement par région'
      : territoryLevel === 'Department'
        ? 'Avancement par département'
        : 'Avancement par abattoir';

  const legend = [
    ...displayedSeries,
    ...(rows.some((row) => row.remaining > 0)
      ? [{ key: 'remaining', label: 'Restant' }]
      : [])
  ];

  return (
    <div
      className={clsx(
        'white-container',
        'full-height',
        cx('fr-px-3w', 'fr-py-2w')
      )}
    >
      <h5 className={cx('fr-text--lg', 'fr-text--regular', 'fr-mb-3w')}>
        {title}
      </h5>
      <div className="territory-rows">
        {rows.map((row) => (
          <div className="territory-row" key={row.key}>
            <span
              className={clsx('territory-row-label', cx('fr-text--sm'))}
              title={row.label}
            >
              {row.label}
            </span>
            <div
              className="territory-row-bar"
              role="img"
              aria-label={`${row.label} : ${row.done} ${row.done > 1 ? 'réalisés' : 'réalisé'} sur ${row.programmedCount} ${row.programmedCount > 1 ? 'programmés' : 'programmé'}`}
            >
              {displayedSeries.map((serie) => {
                const value = serie.of(row.countsByStatus);
                return value === 0 ? null : (
                  <div
                    key={serie.key}
                    className={clsx(
                      'territory-row-segment',
                      `territory-segment-${serie.key}`
                    )}
                    style={{ width: widthOf(value, row.scale) }}
                    title={`${serie.label} : ${value}`}
                  ></div>
                );
              })}
              {row.remaining > 0 && (
                <div
                  className={clsx(
                    'territory-row-segment',
                    'territory-segment-remaining'
                  )}
                  style={{ width: widthOf(row.remaining, row.scale) }}
                  title={`Restant : ${row.remaining}`}
                ></div>
              )}
            </div>
            <span className={clsx('territory-row-total', cx('fr-text--sm'))}>
              {row.done}/{row.programmedCount}
              {row.overflow > 0 && (
                <span className={cx('fr-text--bold')}> +{row.overflow}</span>
              )}
            </span>
          </div>
        ))}
      </div>
      <ul className="territory-legend">
        {legend.map((item) => (
          <li key={item.key}>
            <span
              className={clsx(
                'territory-legend-bullet',
                `territory-segment-${item.key}`
              )}
            ></span>
            <span className={cx('fr-text--sm', 'fr-mb-0')}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardTerritoryChart;
