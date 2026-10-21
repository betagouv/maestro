import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tooltip from '@codegouvfr/react-dsfr/Tooltip';
import clsx from 'clsx';
import {
  analyzedCount,
  type DashboardStats,
  notAdmissibleRate,
  objectiveRate,
  realizedCount
} from 'maestro-shared/schema/Sample/DashboardStats';
import { SampleStatusLabels } from 'maestro-shared/schema/Sample/SampleStatus';
import type { FunctionComponent, ReactNode } from 'react';
import { CircleProgress } from 'src/components/CircleProgress/CircleProgress';
import { pluralize } from 'src/utils/stringUtils';
import './DashboardKpiCards.scss';

type Props = {
  stats: DashboardStats | undefined;
};

const cardClassName = cx('fr-col-12', 'fr-col-md-6', 'fr-col-lg-3');

const KpiCard: FunctionComponent<{
  title: string;
  tooltip?: string;
  children: ReactNode;
}> = ({ title, tooltip, children }) => (
  <div className={cardClassName}>
    <div
      className={clsx(
        'white-container',
        cx('fr-pt-2w', 'fr-pb-3w', 'fr-px-3v')
      )}
    >
      <h6
        className={clsx(
          'd-flex-align-center',
          cx('fr-text--lg', 'fr-text--regular', 'fr-mb-2w')
        )}
      >
        {title}
        {tooltip && (
          <div className={cx('fr-pl-1w')}>
            <Tooltip kind="hover" title={tooltip} />
          </div>
        )}
      </h6>
      {children}
    </div>
  </div>
);

type BadgeTone = 'success' | 'warning' | 'error' | 'pink' | 'blue';

type KpiDetail = {
  label: string;
  value: number;
  tone: BadgeTone;
  share?: number;
};

const KpiDetails: FunctionComponent<{ lines: KpiDetail[] }> = ({ lines }) => {
  const displayedLines = lines.filter((line) => line.value > 0);

  if (displayedLines.length === 0) {
    return null;
  }

  return (
    <div className="kpi-details">
      {displayedLines.map(({ label, value, tone, share }) => (
        <div className="kpi-detail-line" key={label}>
          <Badge
            small
            severity={
              tone === 'pink' || tone === 'blue'
                ? undefined
                : (tone as 'success')
            }
            noIcon={tone === 'pink' || tone === 'blue'}
            className={
              tone === 'pink'
                ? cx('fr-badge--pink-macaron')
                : tone === 'blue'
                  ? cx('fr-badge--blue-cumulus')
                  : undefined
            }
          >
            {label}
          </Badge>
          <span
            className={clsx('kpi-detail-value', cx('fr-text--sm', 'fr-mb-0'))}
          >
            {value}
            {share !== undefined && ` (${share} %)`}
          </span>
        </div>
      ))}
    </div>
  );
};

const DashboardKpiCards: FunctionComponent<Props> = ({ stats }) => {
  if (!stats) {
    return null;
  }

  const realized = realizedCount(stats.countsByStatus);
  const analyzed = analyzedCount(stats.countsByStatus);
  const share = (value: number) =>
    analyzed === 0 ? 0 : Math.round((value / analyzed) * 100);

  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters', 'fr-mb-3w')}>
      <KpiCard title="Prélèvements programmés">
        <h2 className={cx('fr-mb-1v')}>{stats.programmedCount}</h2>
        <p className={cx('fr-text--md', 'fr-mb-0')}>
          {stats.planCount} {pluralize(stats.planCount)('plan')} /{' '}
          {stats.subPlanCount} {pluralize(stats.subPlanCount)('sous-plan')}
        </p>
      </KpiCard>

      <KpiCard
        title="Prélèvements réalisés"
        tooltip="Prélèvements terminés conformes ou non conformes, à interpréter, transmis au laboratoire et en cours d'analyse"
      >
        <h2 className={cx('fr-mb-1v')}>{realized}</h2>
        <CircleProgress
          progress={objectiveRate(realized, stats.programmedCount)}
          sizePx={120}
          type="percentage"
          label="de l'objectif"
        />
        <KpiDetails
          lines={[
            {
              label: SampleStatusLabels.Completed,
              value: stats.countsByStatus.Completed,
              tone: 'success'
            },
            {
              label: SampleStatusLabels.InReview,
              value: stats.countsByStatus.InReview,
              tone: 'warning'
            },
            {
              label: SampleStatusLabels.Sent,
              value: stats.countsByStatus.Sent,
              tone: 'pink'
            },
            {
              label: SampleStatusLabels.Analysis,
              value: stats.countsByStatus.Analysis,
              tone: 'blue'
            }
          ]}
        />
      </KpiCard>

      <KpiCard
        title="Prélèvements analysés"
        tooltip="Prélèvements terminés conformes ou non conformes et à interpréter"
      >
        <h2 className={cx('fr-mb-1v')}>{analyzed}</h2>
        <CircleProgress
          progress={objectiveRate(analyzed, stats.programmedCount)}
          sizePx={120}
          type="percentage"
          label="de l'objectif"
        />
        <KpiDetails
          lines={[
            {
              label: 'Conforme',
              value: stats.compliantCount,
              share: share(stats.compliantCount),
              tone: 'success'
            },
            {
              label: 'Non conforme',
              value: stats.nonCompliantCount,
              share: share(stats.nonCompliantCount),
              tone: 'error'
            },
            {
              label: SampleStatusLabels.InReview,
              value: stats.countsByStatus.InReview,
              share: share(stats.countsByStatus.InReview),
              tone: 'warning'
            }
          ]}
        />
      </KpiCard>

      <KpiCard
        title="Taux de non recevabilité"
        tooltip="Taux calculé sur l'ensemble des échantillons reçus par les laboratoires"
      >
        <h2 className={cx('fr-mb-1v')}>{notAdmissibleRate(stats)} %</h2>
        <p className={cx('fr-text--md', 'fr-mb-0')}>
          {stats.notAdmissibleItemCount}{' '}
          {pluralize(stats.notAdmissibleItemCount)('échantillon')}{' '}
          {pluralize(stats.notAdmissibleItemCount, { ignores: ['non'] })(
            'non recevable'
          )}
        </p>
      </KpiCard>
    </div>
  );
};

export default DashboardKpiCards;
