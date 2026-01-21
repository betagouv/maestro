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
import { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { hasPermission } from 'maestro-shared/schema/User/User';
import { UserPermission } from 'maestro-shared/schema/User/UserPermission';
import {
  canHaveDepartment,
  isNationalRole,
  isRegionalRole,
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
    return isAuthenticated && authUser && canHaveDepartment(authUser.user);
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

  const availableRoutes = useMemo(() => {
    return isAuthenticated
      ? [
          hasUserPermission('viewDashboard') ? 'DashboardRoute' : undefined,
          'NotificationsRoute',
          'DocumentsRoute',
          'ApiDocsRoute',
          'LogoutCallbackRoute',
          hasUserPermission('createResource') ? 'NewDocumentRoute' : undefined,
          hasUserPermission('createResource') ? 'DocumentRoute' : undefined,
          hasUserPermission('readPrescriptions')
            ? 'ProgrammingRoute'
            : undefined,
          hasUserPermission('readSamples') ? 'SamplesByYearRoute' : undefined,
          hasUserPermission('createSample') ? 'NewSampleRoute' : undefined,
          hasUserPermission('updateSample') || hasUserPermission('readSamples')
            ? 'SampleRoute'
            : undefined,
          hasUserPermission('updateSample')
            ? 'SampleAnalysisEditRoute'
            : undefined,
          hasUserPermission('administrationMaestro') ? 'UsersRoute' : undefined,
          hasUserPermission('administrationMaestro') ? 'AdminRoute' : undefined,
          hasUserPermission('readLaboratoryCompetences')
            ? 'LaboratoryAnalyticalCompetencesRoute'
            : undefined
        ].filter(isDefined)
      : ['LoginRoute', 'LoginCallbackRoute'];
  }, [isAuthenticated, hasUserPermission]);

  return {
    user: authUser?.user,
    userRole: authUser?.userRole,
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
