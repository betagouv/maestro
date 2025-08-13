import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Pagination from '@codegouvfr/react-dsfr/Pagination';
import clsx from 'clsx';
import { isNil } from 'lodash-es';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import {
  Prescription,
  PrescriptionSort
} from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  getCompletionRate,
  RegionalPrescription
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { FunctionComponent, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import { CircleProgress } from '../../components/CircleProgress/CircleProgress';
import { pluralize } from '../../utils/stringUtils';
import './DashboardPrescription.scss';

type Props = {
  programmingPlan: ProgrammingPlan;
  prescriptions: Prescription[];
  regionalPrescriptions: RegionalPrescription[];
  className: string;
};
export const DashboardPrescriptionsProgress: FunctionComponent<Props> = ({
  programmingPlan,
  prescriptions,
  regionalPrescriptions,
  className,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const sortedPrescriptions = [...prescriptions]
    .sort(PrescriptionSort)
    .map((prescription) => ({
      prescription,
      regionalPrescription: regionalPrescriptions.find(
        (regionalPrescription) =>
          regionalPrescription.prescriptionId === prescription.id
      )
    }))
    .filter(({ regionalPrescription }) => !isNil(regionalPrescription));

  const itemsPerPage = 12;

  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className={className}>
      <div className={clsx('white-container', cx('fr-p-4w'))}>
        <h5>Détails des prélèvements par matrice</h5>
        <div className={cx('fr-grid-row')}>
          {sortedPrescriptions
            .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
            .map(({ prescription, regionalPrescription }) => (
              <DashboardPrescriptionCard
                key={prescription.id}
                programmingPlan={programmingPlan}
                prescription={prescription}
                regionalPrescription={
                  regionalPrescription as RegionalPrescription
                }
              />
            ))}
        </div>
        <Pagination
          className={cx('fr-mt-4w')}
          defaultPage={currentPage + 1}
          count={Math.ceil(sortedPrescriptions.length / itemsPerPage)}
          getPageLinkProps={(page) => ({
            onClick: () => setCurrentPage(page - 1),
            href: '#'
          })}
        />
      </div>
    </div>
  );
};

const DashboardPrescriptionCard: FunctionComponent<{
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescription: RegionalPrescription;
}> = ({ programmingPlan, prescription, regionalPrescription }) => {
  return (
    <Card
      className={clsx(
        'dashboard-prescription-card',
        cx('fr-col-12', 'fr-col-sm-3')
      )}
      linkProps={{
        to: `${AuthenticatedAppRoutes.SamplesByYearRoute.link(programmingPlan.year)}?programmingPlanId=${programmingPlan.id}&matrixKind=${prescription.matrixKind}`
      }}
      background
      border
      enlargeLink
      title={MatrixKindLabels[prescription.matrixKind]}
      size="small"
      desc={
        <>
          <CircleProgress
            progress={getCompletionRate(regionalPrescription)}
            sizePx={80}
            type="total"
            total={regionalPrescription.sampleCount}
            values={[
              regionalPrescription.realizedSampleCount as number,
              regionalPrescription.inProgressSampleCount as number
            ]}
          />
          <div className={cx('fr-pl-2w')}>
            <div className={clsx('d-flex-align-center')}>
              <div className={clsx('bullet', 'bullet-realized')}></div>
              <span className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                {regionalPrescription.realizedSampleCount}{' '}
                {pluralize(regionalPrescription.realizedSampleCount ?? 0)(
                  'réalisé'
                )}
              </span>
            </div>
            <div className={clsx('d-flex-align-center')}>
              <div className={clsx('bullet', 'bullet-in-progress')}></div>
              <span className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                {regionalPrescription.inProgressSampleCount} en cours
              </span>
            </div>
            <div className={clsx('d-flex-align-center')}>
              <div className={clsx('bullet', 'bullet-remaining')}></div>
              <span className={cx('fr-hint-text', 'fr-text--sm', 'fr-mb-0')}>
                {Math.max(
                  0,
                  regionalPrescription.sampleCount -
                    (regionalPrescription.realizedSampleCount ?? 0) -
                    (regionalPrescription.inProgressSampleCount ?? 0)
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
