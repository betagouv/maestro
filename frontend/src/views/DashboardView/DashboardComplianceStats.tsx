import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { groupBy, sumBy } from 'lodash-es';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { RegionList, Regions } from 'maestro-shared/referential/Region';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import type { ComplianceStat } from 'maestro-shared/schema/Sample/ComplianceStat';
import { type FunctionComponent, useContext, useState } from 'react';
import { ApiClientContext } from '../../services/apiClient';

type Props = {
  programmingPlan: ProgrammingPlanChecked;
};

const nonComplianceRate = (nonCompliant: number, total: number) =>
  total === 0 ? 0 : Math.round((nonCompliant / total) * 100);

const DashboardComplianceStats: FunctionComponent<Props> = ({
  programmingPlan
}) => {
  const apiClient = useContext(ApiClientContext);
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(
    new Set()
  );

  const { data: stats, isLoading } = apiClient.useGetComplianceStatsQuery({
    programmingPlanId: programmingPlan.id
  });

  if (isLoading) {
    return null;
  }

  const byRegion = groupBy(stats ?? [], 'region');

  const toggleRegion = (region: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(region)) {
        next.delete(region);
      } else {
        next.add(region);
      }
      return next;
    });
  };

  const regionStats = RegionList.map((region) => {
    const rows = (byRegion[region] ?? []) as ComplianceStat[];
    return {
      region,
      name: Regions[region]?.name ?? region,
      totalCount: sumBy(rows, 'totalCount'),
      compliantCount: sumBy(rows, 'compliantCount'),
      nonCompliantCount: sumBy(rows, 'nonCompliantCount'),
      matrices: rows
    };
  });

  const tableData = regionStats.flatMap(
    ({
      region,
      name,
      totalCount,
      compliantCount,
      nonCompliantCount,
      matrices
    }) => {
      const regionRow = [
        <strong key={`name-${region}`}>{name}</strong>,
        totalCount,
        compliantCount,
        nonCompliantCount,
        `${nonComplianceRate(nonCompliantCount, totalCount)} %`,
        matrices.length > 0 ? (
          <button
            key={`btn-${region}`}
            type="button"
            className={cx(
              'fr-btn',
              'fr-btn--tertiary-no-outline',
              'fr-btn--sm'
            )}
            onClick={() => toggleRegion(region)}
            aria-expanded={expandedRegions.has(region)}
            aria-label={`Détail par matrice pour ${name}`}
          >
            <span
              className={cx(
                expandedRegions.has(region)
                  ? 'fr-icon-arrow-up-s-line'
                  : 'fr-icon-arrow-down-s-line'
              )}
            />
          </button>
        ) : null
      ];

      const matrixRows = expandedRegions.has(region)
        ? matrices.map((m) => [
            <span
              key={`matrix-${region}-${m.matrix}`}
              style={{ paddingLeft: '1.5rem', fontSize: '0.875rem' }}
            >
              {MatrixLabels[m.matrix] ?? m.matrix}
            </span>,
            m.totalCount,
            m.compliantCount,
            m.nonCompliantCount,
            `${nonComplianceRate(m.nonCompliantCount, m.totalCount)} %`,
            null
          ])
        : [];

      return [regionRow, ...matrixRows];
    }
  );

  return (
    <div className={cx('fr-col-12')}>
      <div className={clsx(cx('fr-px-4w', 'fr-py-3w'), 'white-container')}>
        <h5>Conformité des prélèvements par région</h5>
        <Table
          headers={[
            'Région',
            'Total',
            'Conformes',
            'Non conformes',
            'Taux NC',
            ''
          ]}
          data={tableData}
          noCaption
        />
      </div>
    </div>
  );
};

export default DashboardComplianceStats;
