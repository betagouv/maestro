import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { DistributionKind } from 'maestro-shared/schema/ProgrammingPlan/DistributionKind';
import { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { SampleStatus } from 'maestro-shared/schema/Sample/SampleStatus';
import { UserRole } from 'maestro-shared/schema/User/UserRole';
import { FunctionComponent, useContext, useMemo } from 'react';
import { assert, type Equals } from 'tsafe';
import { DashboardNotice } from '../../components/DashboardNotice/DashboardNotice';
import { useAuthentication } from '../../hooks/useAuthentication';
import { ApiClientContext } from '../../services/apiClient';
import DashboardPriorityActions from './DashboardPriorityActions';

const prioritySamplesStatusList = {
  REGIONAL: {
    Sampler: ['InReview'],
    RegionalCoordinator: ['InReview']
  },
  SLAUGHTERHOUSE: {
    Sampler: ['Submitted'],
    DepartmentalCoordinator: ['Submitted', 'InReview']
  }
} satisfies Record<DistributionKind, Partial<Record<UserRole, SampleStatus[]>>>;

const priorityProgrammingPlansStatusList = {
  NationalCoordinator: [
    'InProgress',
    'SubmittedToRegion',
    'ApprovedByRegion',
    'Validated'
  ],
  RegionalCoordinator: ['SubmittedToRegion'],
  DepartmentalCoordinator: ['SubmittedToDepartments']
} satisfies Partial<Record<UserRole, ProgrammingPlanStatus[]>>;

type Props = {
  currentValidatedProgrammingPlan?: ProgrammingPlanChecked;
};

const DashboardNoticeAndActions: FunctionComponent<Props> = ({
  currentValidatedProgrammingPlan,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();
  const apiClient = useContext(ApiClientContext);
  const { user, userRole } = useAuthentication();

  const prioritySamplesStatus = useMemo(() => {
    if (!currentValidatedProgrammingPlan || !userRole) {
      return undefined;
    }
    const statusByRoleForDistributionKind =
      prioritySamplesStatusList[
        currentValidatedProgrammingPlan.distributionKind
      ];
    return userRole in statusByRoleForDistributionKind
      ? statusByRoleForDistributionKind[
          userRole as keyof typeof statusByRoleForDistributionKind
        ]
      : undefined;
  }, [currentValidatedProgrammingPlan, userRole]);

  const { data: prioritySamples } = apiClient.useFindSamplesQuery(
    {
      programmingPlanId: currentValidatedProgrammingPlan?.id as string,
      status: prioritySamplesStatus,
      sampledBy: user?.id
    },
    {
      skip:
        !currentValidatedProgrammingPlan ||
        !user ||
        !prioritySamplesStatus ||
        prioritySamplesStatus.length === 0
    }
  );

  const priorityProgrammingPlansStatus = useMemo(() => {
    return userRole && userRole in priorityProgrammingPlansStatusList
      ? priorityProgrammingPlansStatusList[
          userRole as keyof typeof priorityProgrammingPlansStatusList
        ]
      : undefined;
  }, [userRole]);

  const { data: priorityProgrammingPlans } =
    apiClient.useFindProgrammingPlansQuery(
      {
        kinds: user?.programmingPlanKinds,
        status: priorityProgrammingPlansStatus
      },
      {
        skip: !user?.programmingPlanKinds || !priorityProgrammingPlansStatus
      }
    );

  const hasPriorityActions = useMemo(() => {
    return (
      (prioritySamples?.length ?? 0) > 0 ||
      (priorityProgrammingPlans?.length ?? 0) > 0
    );
  }, [prioritySamples, priorityProgrammingPlans]);

  const { data: notice } = apiClient.useGetDashboardNoticeQuery();

  return (
    <div className={clsx(cx('fr-grid-row', 'fr-grid-row--gutters'))}>
      {notice?.description && (
        <DashboardNotice
          description={notice.description}
          className={clsx(cx('fr-col'), 'd-flex-column')}
          fullWidth={!hasPriorityActions}
        />
      )}

      <DashboardPriorityActions
        currentValidatedProgrammingPlan={currentValidatedProgrammingPlan}
        prioritySamples={prioritySamples}
        prioritySamplesStatus={prioritySamplesStatus}
        priorityProgrammingPlans={priorityProgrammingPlans}
      />
    </div>
  );
};

export default DashboardNoticeAndActions;
