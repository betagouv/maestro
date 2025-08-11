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
import { Link } from 'react-router';
import { assert, type Equals } from 'tsafe';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import { CircleProgress } from '../../components/CircleProgress/CircleProgress';
import './DashboardMatrix.scss';

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
      <Card
        background
        border
        shadow
        size="medium"
        title="Détails par matrice"
        desc="Objectifs de prélèvements par matrice"
        titleAs="h2"
        end={
          <div
            className={clsx(
              'matrix-list-container',
              cx('fr-grid-row', 'fr-grid-row--gutters')
            )}
          >
            {sortedPrescriptions
              .slice(
                currentPage * itemsPerPage,
                (currentPage + 1) * itemsPerPage
              )
              .map(({ prescription, regionalPrescription }) => (
                <PrescriptionContainer
                  key={prescription.id}
                  programmingPlan={programmingPlan}
                  prescription={prescription}
                  regionalPrescription={
                    regionalPrescription as RegionalPrescription
                  }
                />
              ))}
            {new Array(
              sortedPrescriptions.slice(
                currentPage * itemsPerPage,
                (currentPage + 1) * itemsPerPage
              ).length % 3
            )
              .fill(null)
              .map((_) => (
                <div
                  className={cx('fr-hidden', 'fr-unhidden-sm', 'fr-col-sm-3')}
                ></div>
              ))}
          </div>
        }
        footer={
          <Pagination
            defaultPage={currentPage + 1}
            count={Math.ceil(sortedPrescriptions.length / itemsPerPage)}
            getPageLinkProps={(page) => ({
              onClick: () => setCurrentPage(page - 1),
              href: '#'
            })}
          />
        }
      />
    </div>
  );
};

const PrescriptionContainer: FunctionComponent<{
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescription: RegionalPrescription;
}> = ({ programmingPlan, prescription, regionalPrescription }) => {
  const total = regionalPrescription.sampleCount;
  const done = Math.min(
    regionalPrescription.realizedSampleCount as number,
    regionalPrescription.sampleCount
  );

  return (
    <Link
      className={clsx('matrix-container', cx('fr-col-12', 'fr-col-sm-3'))}
      to={`${AuthenticatedAppRoutes.SamplesByYearRoute.link(programmingPlan.year)}?programmingPlanId=${programmingPlan.id}&matrixKind=${prescription.matrixKind}`}
    >
      <div className={clsx('d-flex-column')}>
        <span className={clsx('matrix-name', cx('fr-text--bold'))}>
          {MatrixKindLabels[prescription.matrixKind]}
        </span>
        <span className={clsx(cx('fr-text--xs', 'fr-text--light'))}>
          {total - done} restants à faire
        </span>
      </div>
      <CircleProgress
        progress={getCompletionRate(regionalPrescription)}
        sizePx={80}
        type="total"
        total={total}
      />
    </Link>
  );
};
