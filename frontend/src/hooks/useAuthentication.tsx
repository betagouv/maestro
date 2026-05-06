import { isNil } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import type { Region } from 'maestro-shared/referential/Region';
import {
  hasLocalPrescriptionPermission,
  type LocalPrescriptionPermission
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  hasPrescriptionPermission,
  type PrescriptionPermission
} from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  hasSamplePermission,
  type SampleChecked,
  type SamplePermission
} from 'maestro-shared/schema/Sample/Sample';
import { hasPermission } from 'maestro-shared/schema/User/User';
import type { UserPermission } from 'maestro-shared/schema/User/UserPermission';
import {
  isDepartmentalRole,
  isNationalRole,
  isRegionalRole,
  type UserRole
} from 'maestro-shared/schema/User/UserRole';
import { isDefined } from 'maestro-shared/utils/utils';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from 'src/hooks/useStore';

export const useAuthentication = () => {
  const { authUser } = useAppSelector((state) => state.auth);

  const isAuthenticated = useMemo(() => !!authUser?.user, [authUser]);

  const hasUserPermission = useCallback(
    (permission: UserPermission) =>
      isDefined(authUser?.user) && hasPermission(authUser.userRole, permission),
    [authUser]
  );

  const hasRole = useCallback(
    (role: UserRole) => {
      return isAuthenticated && authUser?.userRole === role;
    },
    [authUser, isAuthenticated]
  );

  const hasNationalView = useMemo(() => {
    return isAuthenticated && authUser && isNationalRole(authUser.userRole);
  }, [authUser, isAuthenticated]);

  const hasRegionalView = useMemo(() => {
    return isAuthenticated && authUser && isRegionalRole(authUser.userRole);
  }, [authUser, isAuthenticated]);

  const hasDepartmentalView = useMemo(() => {
    return (
      isAuthenticated &&
      authUser &&
      //FIXME pour moi la notion de sample ne devrait pas être présente ici.
      // Au début j'avais juste mis isDepartementalRole, mais lors de ma review j'ai vu que j'avais surement introduit une régression
      (isDepartmentalRole(authUser.userRole) || authUser.userRole === 'Sampler')
    );
  }, [authUser, isAuthenticated]);

  const hasUserPrescriptionPermission = useCallback(
    (
      programmingPlan?: ProgrammingPlanChecked
    ): Record<PrescriptionPermission, boolean> | null =>
      !isNil(authUser?.user) && !isNil(programmingPlan)
        ? hasPrescriptionPermission(authUser?.userRole, programmingPlan)
        : null,
    [authUser]
  );

  const hasUserLocalPrescriptionPermission = useCallback(
    (
      programmingPlan?: ProgrammingPlanChecked,
      localPrescription?: { region: Region; department?: Department | null }
    ): Record<LocalPrescriptionPermission, boolean> | null =>
      !isNil(authUser?.user) &&
      !isNil(localPrescription) &&
      !isNil(programmingPlan)
        ? hasLocalPrescriptionPermission(
            authUser.user,
            authUser.userRole,
            programmingPlan,
            localPrescription
          )
        : null,
    [authUser]
  );

  const hasUserSamplePermission = useCallback(
    (sample: SampleChecked): Record<SamplePermission, boolean> =>
      !isNil(authUser?.user) && !isNil(authUser?.userRole)
        ? hasSamplePermission(authUser.user, authUser.userRole, sample)
        : {
            performAnalysis: false
          },
    [authUser]
  );

  const availableRoutes = useMemo(() => {
    return isAuthenticated
      ? [
          hasUserPermission('viewDashboard') ? 'DashboardRoute' : undefined,
          'NotificationsRoute',
          'DocumentsRoute',
          'LogoutCallbackRoute',
          hasUserPermission('createResource') ? 'NewDocumentRoute' : undefined,
          hasUserPermission('createResource') ? 'DocumentRoute' : undefined,
          hasUserPermission('readPrescriptions')
            ? ['ProgrammingByYearRoute', 'ProgrammingRoute']
            : undefined,
          hasUserPermission('readSamples') ? 'SamplesByYearRoute' : undefined,
          hasUserPermission('createSample') ? 'NewSampleRoute' : undefined,
          hasUserPermission('updateSample') || hasUserPermission('readSamples')
            ? 'SampleRoute'
            : undefined,
          hasUserPermission('performAnalysis')
            ? 'SampleAnalysisEditRoute'
            : undefined,
          hasUserPermission('administrationMaestro') ? 'UsersRoute' : undefined,
          hasUserPermission('administrationMaestro') ? 'AdminRoute' : undefined,
          (hasUserPermission('readLaboratoryCompetences') ||
            hasUserPermission('manageLaboratoryCompetences')) &&
          authUser?.user.programmingPlanKinds.includes('PPV')
            ? 'LaboratoryAnalyticalCompetencesRoute'
            : undefined,
          hasUserPermission('manageLaboratoryAgreements')
            ? 'LaboratoryAgreementsRoute'
            : undefined
        ]
          .flat()
          .filter(isDefined)
      : ['LoginRoute', 'LoginCallbackRoute'];
  }, [isAuthenticated, hasUserPermission, authUser]);

  return {
    user: authUser?.user,
    userRole: authUser?.userRole,
    isAuthenticated,
    hasUserPermission,
    hasUserPrescriptionPermission,
    hasUserLocalPrescriptionPermission,
    hasUserSamplePermission,
    hasRole,
    hasNationalView,
    hasRegionalView,
    hasDepartmentalView,
    availableRoutes
  };
};
