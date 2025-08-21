import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tile from '@codegouvfr/react-dsfr/Tile';
import clsx from 'clsx';
import {
  isClosed,
  ProgrammingPlan
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { FunctionComponent, useContext } from 'react';
import { Link } from 'react-router';
import { assert, type Equals } from 'tsafe';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import SampleCard from '../../components/SampleCard/SampleCard';
import { useAuthentication } from '../../hooks/useAuthentication';
import { ApiClientContext } from '../../services/apiClient';
import ProgrammingPlanClosing from './ProgrammingPlanClosing';

type Props = {
  currentProgrammingPlan: ProgrammingPlan;
  previousProgrammingPlan?: ProgrammingPlan;
  nextProgrammingPlan?: ProgrammingPlan;
  className: string;
};
const DashboardPriorityActions: FunctionComponent<Props> = ({
  currentProgrammingPlan,
  previousProgrammingPlan,
  nextProgrammingPlan,
  className,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();
  const apiClient = useContext(ApiClientContext);

  const { user, hasUserPermission } = useAuthentication();

  const { useFindSamplesQuery } = useContext(ApiClientContext);
  const { data: samplesInReview } = useFindSamplesQuery({
    programmingPlanId: currentProgrammingPlan.id,
    region: user?.region ?? undefined,
    page: 1,
    perPage: 2,
    status: 'InReview'
  });

  const [createProgrammingPlan] = apiClient.useCreateProgrammingPlanMutation();

  if (!samplesInReview) {
    return <></>;
  }

  return (
    <div className={className}>
      <div
        className={clsx(
          'white-container',
          'dashboard-priority-actions-container',
          cx('fr-px-4w', 'fr-py-3w')
        )}
      >
        {hasUserPermission('updateSample') ? (
          <>
            <h4 className={cx('fr-mb-1w')}>Rapports à terminer</h4>
            {samplesInReview.length === 0 ? (
              <>Pas de rapports à terminer</>
            ) : (
              <>
                {samplesInReview?.map((s) => (
                  <SampleCard sample={s} horizontal />
                ))}
                <div className={clsx('more-actions-link')}>
                  <Link
                    to={`${AuthenticatedAppRoutes.SamplesByYearRoute.link(currentProgrammingPlan.year)}?status=InReview`}
                    className={cx('fr-link', 'fr-link--sm')}
                  >
                    Tous les rapports à terminer
                  </Link>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <h4 className={cx('fr-mb-1w')}>Actions prioritaires</h4>

            {hasUserPermission('manageProgrammingPlan') ? (
              <>
                {previousProgrammingPlan &&
                  previousProgrammingPlan.id !== currentProgrammingPlan?.id &&
                  !isClosed(previousProgrammingPlan) &&
                  hasUserPermission('manageProgrammingPlan') && (
                    <ProgrammingPlanClosing
                      programmingPlan={previousProgrammingPlan}
                      render={({ open }) => (
                        <PriorityActionCard
                          title={`Clôturer la programmation ${previousProgrammingPlan.year}`}
                          badgeLabel="Programmation"
                          description="À réaliser"
                          onClick={open}
                        />
                      )}
                    />
                  )}
                {!nextProgrammingPlan ? (
                  <PriorityActionCard
                    title={`Créer la programmation ${new Date().getFullYear() + 1}`}
                    badgeLabel="Programmation"
                    description="À réaliser"
                    onClick={async () => {
                      await createProgrammingPlan(
                        new Date().getFullYear() + 1
                      ).unwrap();
                    }}
                  />
                ) : (
                  <PriorityActionCard
                    title="Editer la programmation"
                    badgeLabel="Programmation"
                    description="À compléter"
                    to={AuthenticatedAppRoutes.ProgrammationByYearRoute.link(
                      nextProgrammingPlan.year
                    )}
                  />
                )}
              </>
            ) : (
              <>Pas d’actions prioritaires identifiées</>
            )}
          </>
        )}
      </div>
    </div>
  );
};

type PriorityActionCardProps = {
  title: string;
  badgeLabel: string;
  description?: string;
  label?: string;
} & (
  | {
      onClick: () => void;
      to?: never;
    }
  | { onClick?: never; to: string }
);

const PriorityActionCard = ({
  title,
  badgeLabel,
  description,
  onClick,
  to
}: PriorityActionCardProps) => {
  return (
    <Tile
      small
      orientation="horizontal"
      start={
        <Badge noIcon className={cx('fr-badge--yellow-tournesol')}>
          {badgeLabel}
        </Badge>
      }
      title={title}
      detail={description}
      {...(onClick ? { buttonProps: { onClick } } : { linkProps: { to } })}
      enlargeLinkOrButton
      titleAs="h3"
    />
  );
};

export default DashboardPriorityActions;
