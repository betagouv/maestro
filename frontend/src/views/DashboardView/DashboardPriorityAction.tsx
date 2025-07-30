import Card from '@codegouvfr/react-dsfr/Card';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { FunctionComponent, useContext } from 'react';
import { Link } from 'react-router';
import { assert, type Equals } from 'tsafe';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import SampleCard from '../../components/SampleCard/SampleCard';
import { ApiClientContext } from '../../services/apiClient';

type Props = {
  programmingPlan: ProgrammingPlan;
  className: string;
};
export const DashboardPriorityAction: FunctionComponent<Props> = ({
  programmingPlan,
  className,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { useFindSamplesQuery } = useContext(ApiClientContext);
  const { data: samplesInReview } = useFindSamplesQuery({
    programmingPlanId: programmingPlan.id,
    page: 1,
    perPage: 2,
    status: 'InReview'
  });

  //FIXME on affiche quoi quand il n'y a pas de prélèvement ?

  return (
    <div className={className}>
      <Card
        background
        border
        shadow
        size="medium"
        title="Rapports à terminer"
        titleAs="h2"
        end={
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            {samplesInReview?.map((s) => (
              <div className={clsx(cx('fr-col-12', 'fr-col-sm-6'))}>
                <SampleCard sample={s} />
              </div>
            ))}
          </div>
        }
        footer={
          <div className={clsx('d-flex-justify-center')}>
            <Link
              to={`${AuthenticatedAppRoutes.SamplesByYearRoute.link(programmingPlan.year)}?status=InReview`}
              className={cx('fr-link', 'fr-link--sm')}
            >
              Tous les rapports à terminer
            </Link>
          </div>
        }
      ></Card>
    </div>
  );
};
