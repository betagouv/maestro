import {
  hasPrescriptionPermission,
  PrescriptionPermission
} from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  hasRegionalPrescriptionPermission,
  RegionalPrescription,
  RegionalPrescriptionPermission
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { hasPermission } from 'maestro-shared/schema/User/User';
import { UserPermission } from 'maestro-shared/schema/User/UserPermission';
import { UserRole } from 'maestro-shared/schema/User/UserRole';
import { isDefined } from 'maestro-shared/utils/utils';
import { ReactElement, useCallback, useMemo } from 'react';
import YearRoute from 'src/components/YearRoute/YearRoute';
import { useAppSelector } from 'src/hooks/useStore';
import DashboardView from 'src/views/DashboardView/DashboardView';
import DocumentListView from 'src/views/DocumentListView/DocumentListView';
import HomeView from 'src/views/HomeView/HomeView';
import { OpenApiExplorerView } from 'src/views/OpenApiExplorer/OpenApiExplorerView';
import PrescriptionListView from 'src/views/PrescriptionListView/PrescriptionListView';
import SampleListView from 'src/views/SampleListView/SampleListView';
import SampleView from 'src/views/SampleView/SampleView';

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
      return isAuthenticated && authUser?.user?.roles.includes(role);
    },
    [authUser, isAuthenticated]
  );

  const hasNationalView = useMemo(() => {
    return isAuthenticated && !authUser?.user?.region;
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
      regionalPrescription: RegionalPrescription
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

  const availableRoutes: {
    path: string;
    label: string;
    key: string;
    component: () => ReactElement;
  }[] = useMemo(() => {
    return [
      ...(isAuthenticated
        ? [
            {
              path: '/',
              label: 'Tableau de bord',
              key: 'dashboard_route',
              component: DashboardView
            },
            hasUserPermission('readPrescriptions')
              ? {
                  path: '/prescriptions/:year',
                  label: 'Prescriptions',
                  key: 'prescription_route',
                  component: () => <YearRoute element={PrescriptionListView} />
                }
              : undefined,
            hasUserPermission('readSamples')
              ? {
                  path: '/prelevements/:year',
                  label: 'Prélèvements',
                  key: 'samples_route',
                  component: () => <YearRoute element={SampleListView} />
                }
              : undefined,
            hasUserPermission('createSample')
              ? {
                  path: '/prelevements/:year/nouveau',
                  label: 'Prélèvement',
                  key: 'new_sample_route',
                  component: () => <YearRoute element={SampleView} />
                }
              : undefined,
            hasUserPermission('updateSample') ||
            hasUserPermission('readSamples')
              ? {
                  path: '/prelevements/:year/:sampleId/*',
                  label: 'Prélèvement',
                  key: 'sample_route',
                  component: () => <YearRoute element={SampleView} />
                }
              : undefined,
            {
              path: '/documents',
              label: 'Documents ressources',
              key: 'documents_route',
              component: DocumentListView
            },
            {
              path: '/api-docs',
              label: 'API Docs',
              key: 'api_docs',
              component: OpenApiExplorerView
            }
          ]
        : [
            {
              path: '/',
              label: 'Connexion',
              key: 'signin_route',
              component: HomeView
            }
          ])
    ].filter(isDefined);
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
