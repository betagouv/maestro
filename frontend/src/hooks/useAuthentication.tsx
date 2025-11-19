import { isNil } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import { Region } from 'maestro-shared/referential/Region';
import {
  hasLocalPrescriptionPermission,
  LocalPrescriptionPermission
} from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import {
  hasPrescriptionPermission,
  PrescriptionPermission
} from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { hasPermission } from 'maestro-shared/schema/User/User';
import { UserPermission } from 'maestro-shared/schema/User/UserPermission';
import {
  canHaveDepartment,
  hasNationalRole,
  hasRegionalRole,
  UserRole
} from 'maestro-shared/schema/User/UserRole';
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

  const hasRegionalView = useMemo(() => {
    return isAuthenticated && authUser && hasRegionalRole(authUser.user);
  }, [authUser, isAuthenticated]);

  const hasDepartmentalView = useMemo(() => {
    return isAuthenticated && authUser && canHaveDepartment(authUser.user);
  }, [authUser, isAuthenticated]);

  const hasUserPrescriptionPermission = useCallback(
    (
      programmingPlan?: ProgrammingPlan
    ): Record<PrescriptionPermission, boolean> | null =>
      !isNil(authUser?.user) && !isNil(programmingPlan)
        ? hasPrescriptionPermission(authUser?.user, programmingPlan)
        : null,
    [authUser]
  );

  const hasUserLocalPrescriptionPermission = useCallback(
    (
      programmingPlan?: ProgrammingPlan,
      localPrescription?: { region: Region; department?: Department | null }
    ): Record<LocalPrescriptionPermission, boolean> | null =>
      !isNil(authUser?.user) &&
      !isNil(localPrescription) &&
      !isNil(programmingPlan)
        ? hasLocalPrescriptionPermission(
            authUser.user,
            programmingPlan,
            localPrescription
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
            ? 'ProgrammingRoute'
            : undefined,
          hasUserPermission('readSamples') ? 'SamplesByYearRoute' : undefined,
          hasUserPermission('createSample') ? 'NewSampleRoute' : undefined,
          hasUserPermission('updateSample') || hasUserPermission('readSamples')
            ? 'SampleRoute'
            : undefined,
          hasUserPermission('administrationMaestro') ? 'UsersRoute' : undefined,
          hasUserPermission('administrationMaestro') ? 'AdminRoute' : undefined
        ].filter(isDefined)
      : ['LoginRoute', 'LoginCallbackRoute'];
  }, [isAuthenticated, hasUserPermission]);

  return {
    user: authUser?.user,
    isAuthenticated,
    hasUserPermission,
    hasUserPrescriptionPermission,
    hasUserLocalPrescriptionPermission,
    hasRole,
    hasNationalView,
    hasRegionalView,
    hasDepartmentalView,
    availableRoutes
  };
};
