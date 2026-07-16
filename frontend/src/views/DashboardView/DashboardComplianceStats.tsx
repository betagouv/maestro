import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import clsx from 'clsx';
import { groupBy, sumBy } from 'lodash-es';
import {
  type Department,
  DepartmentLabels
} from 'maestro-shared/referential/Department';
import {
  type MatrixKind,
  MatrixKindLabels
} from 'maestro-shared/referential/Matrix/MatrixKind';
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
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);
  const [expandedMatrixKinds, setExpandedMatrixKinds] = useState<string[]>([]);

  const isPPV = programmingPlan?.subPlans.some(
    (sp) => sp.subPlanNumber === 'PPV'
  );

  const { data: stats, isLoading } = apiClient.useGetComplianceStatsQuery({
    programmingPlanId: programmingPlan.id,
    byDepartment: !isPPV
  });

  if (isLoading) {
    return null;
  }

  const byRegion = groupBy(stats ?? [], 'region');

  const regionStats = RegionList.map((region) => {
    const rows = (byRegion[region] ?? []) as ComplianceStat[];

    if (!isPPV) {
      const departmentStats = rows
        .filter((r) => r.department != null)
        .map((r) => ({
          department: r.department as Department,
          label: DepartmentLabels[r.department as Department] ?? r.department,
          totalCount: r.totalCount,
          compliantCount: r.compliantCount,
          nonCompliantCount: r.nonCompliantCount
        }))
        .sort((a, b) => (a.department ?? '').localeCompare(b.department ?? ''));
      return {
        region,
        name: Regions[region]?.name ?? region,
        totalCount: sumBy(rows, 'totalCount'),
        compliantCount: sumBy(rows, 'compliantCount'),
        nonCompliantCount: sumBy(rows, 'nonCompliantCount'),
        departmentStats,
        matrixKindStats: []
      };
    }

    const byMatrixKind = groupBy(rows, (r) => r.matrixKind);
    const matrixKindStats = Object.entries(byMatrixKind).map(
      ([kind, kindRows]) => ({
        kind: kind as MatrixKind,
        label: MatrixKindLabels[kind as MatrixKind] ?? kind,
        totalCount: sumBy(kindRows, 'totalCount'),
        compliantCount: sumBy(kindRows, 'compliantCount'),
        nonCompliantCount: sumBy(kindRows, 'nonCompliantCount'),
        matrixList: kindRows
      })
    );
    return {
      region,
      name: Regions[region]?.name ?? region,
      totalCount: sumBy(rows, 'totalCount'),
      compliantCount: sumBy(rows, 'compliantCount'),
      nonCompliantCount: sumBy(rows, 'nonCompliantCount'),
      matrixKindStats,
      departmentStats: []
    };
  });

  const tableData = regionStats.flatMap(
    ({
      region,
      name,
      totalCount,
      compliantCount,
      nonCompliantCount,
      matrixKindStats,
      departmentStats
    }) => {
      const hasChildren = isPPV
        ? matrixKindStats.length > 0
        : departmentStats.length > 0;

      const regionRow = [
        <span key={`name-${region}`} className={cx('fr-text--bold')}>
          {name}
        </span>,
        totalCount,
        compliantCount,
        nonCompliantCount,
        `${nonComplianceRate(nonCompliantCount, totalCount)} %`,
        hasChildren ? (
          <Button
            key={`btn-${region}`}
            priority="tertiary no outline"
            size="small"
            iconId={
              expandedRegions.includes(region)
                ? 'fr-icon-arrow-up-s-line'
                : 'fr-icon-arrow-down-s-line'
            }
            onClick={() =>
              setExpandedRegions((prev) =>
                prev.includes(region)
                  ? prev.filter((k) => k !== region)
                  : [...prev, region]
              )
            }
            title={`Détail par ${isPPV ? 'type de matrice' : 'département'} pour ${name}`}
          />
        ) : null
      ];

      const childRows = expandedRegions.includes(region)
        ? isPPV
          ? matrixKindStats.flatMap(
              ({
                kind,
                label,
                totalCount,
                compliantCount,
                nonCompliantCount,
                matrixList
              }) => {
                const matrixKindKey = `${region}-${kind}`;
                const matrixKindRow = [
                  <span
                    key={`kind-${matrixKindKey}`}
                    className={cx('fr-text--sm', 'fr-pl-3v')}
                  >
                    {label}
                  </span>,
                  totalCount,
                  compliantCount,
                  nonCompliantCount,
                  `${nonComplianceRate(nonCompliantCount, totalCount)} %`,
                  matrixList.length > 1 ? (
                    <Button
                      key={`btn-${matrixKindKey}`}
                      priority="tertiary no outline"
                      size="small"
                      iconId={
                        expandedMatrixKinds.includes(matrixKindKey)
                          ? 'fr-icon-arrow-up-s-line'
                          : 'fr-icon-arrow-down-s-line'
                      }
                      onClick={() =>
                        setExpandedMatrixKinds((prev) =>
                          prev.includes(matrixKindKey)
                            ? prev.filter((k) => k !== matrixKindKey)
                            : [...prev, matrixKindKey]
                        )
                      }
                      title={`Détail par matrice pour ${label} en ${name}`}
                    />
                  ) : null
                ];

                const matrixRows = expandedMatrixKinds.includes(matrixKindKey)
                  ? matrixList.map((m) => [
                      <span
                        key={`matrix-${region}-${m.matrix}`}
                        className={cx('fr-text--sm', 'fr-pl-6v')}
                      >
                        {MatrixLabels[m.matrix!] ?? m.matrix}
                      </span>,
                      m.totalCount,
                      m.compliantCount,
                      m.nonCompliantCount,
                      `${nonComplianceRate(m.nonCompliantCount, m.totalCount)} %`,
                      null
                    ])
                  : [];

                return [matrixKindRow, ...matrixRows];
              }
            )
          : departmentStats.map(
              ({
                department,
                label,
                totalCount,
                compliantCount,
                nonCompliantCount
              }) => [
                <span
                  key={`dept-${region}-${department}`}
                  className={cx('fr-text--sm', 'fr-pl-3v')}
                >
                  {label}
                </span>,
                totalCount,
                compliantCount,
                nonCompliantCount,
                `${nonComplianceRate(nonCompliantCount, totalCount)} %`,
                null
              ]
            )
        : [];

      return [regionRow, ...childRows];
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
