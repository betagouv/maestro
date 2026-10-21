import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { sumBy } from 'lodash-es';
import {
  getCompletionRate,
  type LocalPrescription
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import type { FunctionComponent, ReactNode } from 'react';
import { CircleProgress } from 'src/components/CircleProgress/CircleProgress';
import { pluralize } from 'src/utils/stringUtils';
import '../Dashboard.scss';

type Props = {
  title: string;
  linkTo: string;
  localPrescriptions: LocalPrescription[];
  header?: ReactNode;
};

export const ProgressCard: FunctionComponent<Props> = ({
  title,
  linkTo,
  localPrescriptions,
  header
}) => {
  const realizedCount = sumBy(localPrescriptions, 'realizedSampleCount');
  const notAdmissibleCount = sumBy(
    localPrescriptions,
    'notAdmissibleSampleCount'
  );
  const inProgressCount = sumBy(localPrescriptions, 'inProgressSampleCount');
  const programmedCount = sumBy(localPrescriptions, 'sampleCount');

  return (
    <Card
      className={clsx(
        'dashboard-prescription-card',
        cx('fr-col-12', 'fr-col-sm-3')
      )}
      linkProps={{ to: linkTo }}
      background
      border
      enlargeLink
      title={title}
      start={header}
      size="small"
      end={
        <>
          <CircleProgress
            progress={getCompletionRate(
              localPrescriptions.map((localPrescription) => ({
                ...localPrescription,
                realizedSampleCount:
                  (localPrescription.realizedSampleCount ?? 0) -
                  (localPrescription.notAdmissibleSampleCount ?? 0)
              }))
            )}
            sizePx={80}
            type="total"
            total={programmedCount}
            values={[realizedCount - notAdmissibleCount, inProgressCount]}
          />
          <div className={cx('fr-pl-2w')}>
            <div className={clsx('d-flex-align-center')}>
              <div className={clsx('bullet', 'realized')}></div>
              <span className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                {realizedCount} {pluralize(realizedCount)('réalisé')}
              </span>
            </div>
            {notAdmissibleCount > 0 && (
              <ul
                className={cx(
                  'fr-hint-text',
                  'fr-text--xs',
                  'fr-mb-0',
                  'fr-pl-3w'
                )}
              >
                <li>
                  {notAdmissibleCount}{' '}
                  {pluralize(notAdmissibleCount, { ignores: ['non'] })(
                    'non recevable'
                  )}
                </li>
              </ul>
            )}
            <div className={clsx('d-flex-align-center')}>
              <div className={clsx('bullet', 'in-progress')}></div>
              <span className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                {inProgressCount} en cours
              </span>
            </div>
            <div className={clsx('d-flex-align-center')}>
              <div className={clsx('bullet', 'remaining')}></div>
              <span className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                {Math.max(
                  0,
                  programmedCount -
                    (realizedCount - notAdmissibleCount) -
                    inProgressCount
                )}{' '}
                à faire
              </span>
            </div>
          </div>
        </>
      }
    ></Card>
  );
};
