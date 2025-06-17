import { Region } from 'maestro-shared/referential/Region';
import {
  hasPrescriptionPermission,
  PrescriptionPermission
} from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  hasRegionalPrescriptionPermission,
  RegionalPrescriptionPermission
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import {
  hasNationalRole,
  hasPermission
} from 'maestro-shared/schema/User/User';
import { UserPermission } from 'maestro-shared/schema/User/UserPermission';
import { UserRole } from 'maestro-shared/schema/User/UserRole';
import { isDefined } from 'maestro-shared/utils/utils';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from 'src/hooks/useStore';

export const useAuthentication = () => {
  const { authUser } = useAppSelector((state) => state.auth);

  const isAuthenticated = useMemo(() => !!authUser?.user, [authUser]);

  const hasUserPermission = useCallback(
    (permission: UserPermission) =>
      isDefined(authUser?.user) && hasPermission(authUser.user, permission),
    [authUser]
  );

  const hasRole = useCallback(
    (role: UserRole) => {
      return isAuthenticated && authUser?.user?.role === role;
    },
    [authUser, isAuthenticated]
  );

  const hasNationalView = useMemo(() => {
    return isAuthenticated && authUser && hasNationalRole(authUser.user);
  }, [authUser, isAuthenticated]);

  const hasUserPrescriptionPermission = useCallback(
    (
      programmingPlan: ProgrammingPlan
    ): Record<PrescriptionPermission, boolean> | null =>
      isDefined(authUser?.user)
        ? hasPrescriptionPermission(authUser?.user, programmingPlan)
        : null,
    [authUser]
  );

  const hasUserRegionalPrescriptionPermission = useCallback(
    (
      programmingPlan: ProgrammingPlan,
      regionalPrescription: { region: Region }
    ): Record<RegionalPrescriptionPermission, boolean> | null =>
      isDefined(authUser?.user)
        ? hasRegionalPrescriptionPermission(
            authUser.user,
            programmingPlan,
            regionalPrescription
          )
        : null,
    [authUser]
  );

  const availableRoutes = useMemo(() => {
    return isAuthenticated
      ? [
          'DashboardRoute',
          'NotificationsRoute',
          'DocumentsRoute',
          'ApiDocsRoute',
          'LogoutCallbackRoute',
          hasUserPermission('readPrescriptions')
            ? 'ProgrammationByYearRoute'
            : undefined,
          hasUserPermission('readSamples') ? 'SamplesByYearRoute' : undefined,
          hasUserPermission('createSample') ? 'NewSampleRoute' : undefined,
          hasUserPermission('updateSample') || hasUserPermission('readSamples')
            ? 'SampleRoute'
            : undefined
        ].filter(isDefined)
      : ['LoginRoute', 'LoginCallbackRoute'];
  }, [isAuthenticated, hasUserPermission]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    user: authUser?.user,
    isAuthenticated,
    hasUserPermission,
    hasUserPrescriptionPermission,
    hasUserRegionalPrescriptionPermission,
    hasRole,
    hasNationalView,
    availableRoutes
  };
};
