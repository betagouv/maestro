import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tile from '@codegouvfr/react-dsfr/Tile';
import clsx from 'clsx';
import { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { PartialSample } from 'maestro-shared/schema/Sample/Sample';
import { SampleStatus } from 'maestro-shared/schema/Sample/SampleStatus';
import { FunctionComponent, useContext } from 'react';
import { Link } from 'react-router';
import { assert, type Equals } from 'tsafe';
import { AuthenticatedAppRoutes } from '../../AppRoutes';
import SampleCard from '../../components/SampleCard/SampleCard';
import { useAuthentication } from '../../hooks/useAuthentication';
import { ApiClientContext } from '../../services/apiClient';
import ProgrammingPlanClosing from './ProgrammingPlanClosing';

type Props = {
  currentValidatedProgrammingPlan?: ProgrammingPlanChecked;
  prioritySamples?: PartialSample[];
  prioritySamplesStatus?: SampleStatus[];
  priorityProgrammingPlans?: ProgrammingPlanChecked[];
};

const DashboardPriorityActions: FunctionComponent<Props> = ({
  currentValidatedProgrammingPlan,
  prioritySamples,
  prioritySamplesStatus,
  priorityProgrammingPlans,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();
  const apiClient = useContext(ApiClientContext);

  const { user, hasUserPermission } = useAuthentication();

  const [createProgrammingPlan] = apiClient.useCreateProgrammingPlanMutation();

  if (!prioritySamples?.length && !priorityProgrammingPlans?.length) {
    return <></>;
  }

  return (
    <div className={cx('fr-col')}>
      <div
        className={clsx(
          'white-container',
          'dashboard-priority-actions-container',
          cx('fr-px-4w', 'fr-py-3w')
        )}
      >
        {priorityProgrammingPlans && priorityProgrammingPlans.length > 0 && (
          <>
            <h4 className={cx('fr-mb-1w')}>Actions prioritaires</h4>
            {priorityProgrammingPlans
              .filter(
                (programmingPlan) =>
                  programmingPlan.id !== currentValidatedProgrammingPlan?.id
              )
              .map((programmingPlan) => (
                <>
                  {hasUserPermission('manageProgrammingPlan') &&
                  programmingPlan.regionalStatus.every(
                    (_) => _.status === 'Validated'
                  ) ? (
                    <ProgrammingPlanClosing
                      programmingPlan={programmingPlan}
                      render={({ open }) => (
                        <PriorityActionCard
                          title={`Clôturer la programmation ${programmingPlan.year}`}
                          badgeLabel="Programmation"
                          description="À réaliser"
                          onClick={open}
                        />
                      )}
                    />
                  ) : (
                    <PriorityActionCard
                      key={programmingPlan.id}
                      title={`Éditer la programmation ${programmingPlan.year}`}
                      badgeLabel="Programmation"
                      description="À compléter"
                      to={`${AuthenticatedAppRoutes.ProgrammingRoute.link}?${new URLSearchParams(
                        {
                          year: String(programmingPlan.year)
                        }
                      ).toString()}`}
                    />
                  )}
                </>
              ))}
            {hasUserPermission('manageProgrammingPlan') &&
              currentValidatedProgrammingPlan &&
              priorityProgrammingPlans.every(
                (programmingPlan) =>
                  programmingPlan.year <= currentValidatedProgrammingPlan.year
              ) && (
                <PriorityActionCard
                  title={`Créer la programmation ${currentValidatedProgrammingPlan?.year + 1}`}
                  badgeLabel="Programmation"
                  description="À réaliser"
                  onClick={async () => {
                    await createProgrammingPlan(
                      currentValidatedProgrammingPlan?.year + 1
                    ).unwrap();
                  }}
                />
              )}
          </>
        )}
        {!priorityProgrammingPlans?.length &&
          currentValidatedProgrammingPlan &&
          prioritySamples && (
            <>
              <h4 className={cx('fr-mb-1w')}>Actions à terminer</h4>
              {(prioritySamples ?? []).length === 0 ? (
                <>Pas d'actions à terminer</>
              ) : (
                <>
                  {prioritySamples?.map((s) => (
                    <SampleCard sample={s} horizontal key={s.id} />
                  ))}
                  {prioritySamplesStatus && (
                    <div className={clsx('more-actions-link')}>
                      <Link
                        to={`${AuthenticatedAppRoutes.SamplesByYearRoute.link(currentValidatedProgrammingPlan.year)}?status=${prioritySamplesStatus}&sampledBy=${user?.id}`}
                        className={cx('fr-link', 'fr-link--sm')}
                      >
                        Toutes les actions à terminer
                      </Link>
                    </div>
                  )}
                </>
              )}
            </>
          )}
      </div>
    </div>
  );
};

export type PriorityActionCardProps = {
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
