import { BarChart } from '@codegouvfr/react-dsfr/Chart/BarChart';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tooltip from '@codegouvfr/react-dsfr/Tooltip';
import clsx from 'clsx';
import { isNil } from 'lodash-es';
import type { DashboardStats } from 'maestro-shared/schema/Sample/DashboardStats';
import type { FunctionComponent } from 'react';

type Props = {
  stats: DashboardStats | undefined;
};

const monthLabels = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre'
];

const formatHours = (hours: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(hours);

const DashboardLaboratoryShipments: FunctionComponent<Props> = ({ stats }) => {
  if (!stats) {
    return null;
  }

  const countByMonth = new Map(
    stats.sentByMonth.map(({ month, count }) => [month, count])
  );

  return (
    <div className={clsx('white-container', cx('fr-px-3w', 'fr-py-2w'))}>
      <h5
        className={clsx(
          'd-flex-align-center',
          cx('fr-text--lg', 'fr-text--regular', 'fr-mb-3w')
        )}
      >
        Prélèvements transmis aux laboratoires
        <Tooltip
          kind="hover"
          title="Comptabilise le nombre de prélèvements dont la ou les DAI ont été envoyées dans le mois"
        />
      </h5>
      <BarChart
        x={[monthLabels]}
        y={[monthLabels.map((_, index) => countByMonth.get(index + 1) ?? 0)]}
        name={['Prélèvements transmis']}
        color={['green-bourgeon']}
      />
      {!isNil(stats.averageSampledToDaiHours) && (
        <div
          className={clsx(
            'd-flex-align-center',
            cx('fr-mt-2w', 'fr-px-2w', 'fr-py-1w')
          )}
        >
          <span
            className={clsx(cx('fr-icon-time-line', 'fr-mr-2w'), 'fr-icon--md')}
            aria-hidden="true"
          ></span>
          <div>
            <p className={cx('fr-text--lead', 'fr-mb-0', 'fr-text--bold')}>
              {formatHours(stats.averageSampledToDaiHours)} heures
            </p>
            <p className={cx('fr-hint-text', 'fr-mb-0')}>
              En moyenne, entre le prélèvement et l'envoi de la DAI
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLaboratoryShipments;
