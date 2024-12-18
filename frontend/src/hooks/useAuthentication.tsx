import { skipToken } from '@reduxjs/toolkit/query';
import { ReactElement, useCallback, useMemo } from 'react';
import {
  hasPrescriptionPermission,
  PrescriptionPermission
} from 'shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  hasRegionalPrescriptionPermission,
  RegionalPrescription,
  RegionalPrescriptionPermission
} from 'shared/schema/RegionalPrescription/RegionalPrescription';
import { hasPermission } from 'shared/schema/User/User';
import { UserPermission } from 'shared/schema/User/UserPermission';
import { UserRole } from 'shared/schema/User/UserRole';
import { isDefined } from 'shared/utils/utils';
import YearRoute from 'src/components/YearRoute/YearRoute';
import { useAppSelector } from 'src/hooks/useStore';
import { useGetUserInfosQuery } from 'src/services/user.service';
import DashboardView from 'src/views/DashboardView/DashboardView';
import DocumentListView from 'src/views/DocumentListView/DocumentListView';
import HomeView from 'src/views/HomeView/HomeView';
import PrescriptionListView from 'src/views/PrescriptionListView/PrescriptionListView';
import SampleListView from 'src/views/SampleListView/SampleListView';
import SampleView from 'src/views/SampleView/SampleView';
import { OpenApiExplorerView } from 'src/views/OpenApiExplorer/OpenApiExplorerView';

export const useAuthentication = () => {
  const { authUser } = useAppSelector((state) => state.auth);

  const { data: userInfos } = useGetUserInfosQuery(
    authUser?.userId ?? skipToken
  );

  const isAuthenticated = useMemo(() => !!authUser?.userId, [authUser]);

  const hasUserPermission = useCallback(
    (permission: UserPermission) =>
      isDefined(authUser?.userId) &&
      isDefined(userInfos) &&
      hasPermission(userInfos, permission),
    [authUser, userInfos]
  );

  const hasRole = useCallback(
    (role: UserRole) => {
      return isAuthenticated && userInfos && userInfos?.roles.includes(role);
    },
    [userInfos, isAuthenticated]
  );

  const hasNationalView = useMemo(() => {
    return isAuthenticated && !userInfos?.region;
  }, [userInfos, isAuthenticated]);

  const hasUserPrescriptionPermission = useCallback(
    (
      programmingPlan: ProgrammingPlan
    ): Record<PrescriptionPermission, boolean> | null =>
      isDefined(authUser?.userId) && isDefined(userInfos)
        ? hasPrescriptionPermission(userInfos, programmingPlan)
        : null,
    [authUser, userInfos]
  );

  const hasUserRegionalPrescriptionPermission = useCallback(
    (
      programmingPlan: ProgrammingPlan,
      regionalPrescription: RegionalPrescription
    ): Record<RegionalPrescriptionPermission, boolean> | null =>
      isDefined(authUser?.userId) && isDefined(userInfos)
        ? hasRegionalPrescriptionPermission(
            userInfos,
            programmingPlan,
            regionalPrescription
          )
        : null,
    [authUser, userInfos]
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
            path:'/api-docs',
            label: 'API Docs',
            key:'api_docs',
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
    userInfos,
    isAuthenticated,
    hasUserPermission,
    hasUserPrescriptionPermission,
    hasUserRegionalPrescriptionPermission,
    hasRole,
    hasNationalView,
    availableRoutes
  };
};
