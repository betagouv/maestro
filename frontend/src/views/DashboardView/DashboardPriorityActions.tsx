import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { FunctionComponent, useContext } from 'react';
import { Link } from 'react-router';
import { assert, type Equals } from 'tsafe';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import SampleCard from '../../components/SampleCard/SampleCard';
import { useAuthentication } from '../../hooks/useAuthentication';
import { ApiClientContext } from '../../services/apiClient';

type Props = {
  programmingPlan: ProgrammingPlan;
  className: string;
};
const DashboardPriorityActions: FunctionComponent<Props> = ({
  programmingPlan,
  className,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { user } = useAuthentication();

  const { useFindSamplesQuery } = useContext(ApiClientContext);
  const { data: samplesInReview } = useFindSamplesQuery({
    programmingPlanId: programmingPlan.id,
    region: user?.region ?? undefined,
    page: 1,
    perPage: 2,
    status: 'InReview'
  });

  if (!samplesInReview) {
    return <></>;
  }

  return (
    <div className={className}>
      <div
        className={clsx(
          'white-container',
          'dashboard-priority-actions-container',
          cx('fr-p-3w')
        )}
      >
        <h5 className={cx('fr-mb-1w')}>Rapports à terminer</h5>
        {samplesInReview.length === 0 ? (
          <>Vous n'avez pas de rapport à terminer</>
        ) : (
          <>
            {samplesInReview?.map((s) => <SampleCard sample={s} horizontal />)}
            <div className={clsx('more-actions-link')}>
              <Link
                to={`${AuthenticatedAppRoutes.SamplesByYearRoute.link(programmingPlan.year)}?status=InReview`}
                className={cx('fr-link', 'fr-link--sm')}
              >
                Tous les rapports à terminer
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPriorityActions;
