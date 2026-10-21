import { BarChart } from '@codegouvfr/react-dsfr/Chart/BarChart';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
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
    label: SampleStatusLabels.Completed,
    color: 'green-bourgeon' as const,
    of: (counts: DashboardStats['countsByStatus']) => counts.Completed
  },
  {
    label: SampleStatusLabels.InReview,
    color: 'orange-terre-battue' as const,
    of: (counts: DashboardStats['countsByStatus']) => counts.InReview
  },
  {
    label: SampleStatusLabels.Sent,
    color: 'pink-macaron' as const,
    of: (counts: DashboardStats['countsByStatus']) => counts.Sent
  },
  {
    label: SampleStatusLabels.Analysis,
    color: 'blue-cumulus' as const,
    of: (counts: DashboardStats['countsByStatus']) => counts.Analysis
  },
  {
    label: SampleStatusLabels.Submitted,
    color: 'yellow-tournesol' as const,
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

  const labels = rows.map((row) => row.label);
  const remainingTotal = sumBy(rows, 'remaining');

  const chartSeries = [
    ...displayedSeries.map((serie) => ({
      name: serie.label,
      color: serie.color,
      values: rows.map((row) => serie.of(row.countsByStatus))
    })),
    ...(remainingTotal > 0
      ? [
          {
            name: 'Restant',
            color: 'beige-gris-galet' as const,
            values: rows.map((row) => row.remaining)
          }
        ]
      : [])
  ];

  const title =
    territoryLevel === 'Region'
      ? 'Avancement par région'
      : territoryLevel === 'Department'
        ? 'Avancement par département'
        : 'Avancement par abattoir';

  return (
    <div className={clsx('white-container', cx('fr-px-3w', 'fr-py-2w'))}>
      <h5 className={cx('fr-text--lg', 'fr-text--regular', 'fr-mb-3w')}>
        {title}
      </h5>
      <div className="territory-chart">
        <BarChart
          horizontal
          stacked
          x={chartSeries.map(() => labels)}
          y={chartSeries.map((serie) => serie.values)}
          name={chartSeries.map((serie) => serie.name)}
          color={chartSeries.map((serie) => serie.color)}
        />
        <ul className="territory-chart-overflows">
          {rows.map((row) => (
            <li key={row.key}>
              {row.overflow > 0 && (
                <span className={cx('fr-text--sm', 'fr-text--bold')}>
                  +{row.overflow}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardTerritoryChart;
