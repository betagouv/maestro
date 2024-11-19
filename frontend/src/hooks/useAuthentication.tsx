import { skipToken } from '@reduxjs/toolkit/query';
import { ReactElement, useMemo } from 'react';
import { hasPermission as hasUserPermission } from 'shared/schema/User/User';
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

export const useAuthentication = () => {
  const { authUser } = useAppSelector((state) => state.auth);

  const { data: userInfos } = useGetUserInfosQuery(
    authUser?.userId ?? skipToken
  );

  const isAuthenticated = useMemo(() => !!authUser?.userId, [authUser]);

  const hasPermission = useMemo(
    () => (permission: UserPermission) => {
      return (
        isDefined(authUser?.userId) &&
        isDefined(userInfos) &&
        hasUserPermission(userInfos, permission)
      );
    },
    [authUser, userInfos]
  );

  const hasRole = useMemo(
    () => (role: UserRole) => {
      return isAuthenticated && userInfos && userInfos?.roles.includes(role);
    },
    [userInfos, isAuthenticated]
  );

  const hasNationalView = useMemo(() => {
    return isAuthenticated && !userInfos?.region;
  }, [userInfos, isAuthenticated]);

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
              component: DashboardView,
            },
            hasPermission('readPrescriptions')
              ? {
                  path: '/prescriptions/:year',
                  label: 'Prescriptions',
                  key: 'prescription_route',
                  component: () => <YearRoute element={PrescriptionListView} />,
                }
              : undefined,
            hasPermission('readSamples')
              ? {
                  path: '/prelevements/:year',
                  label: 'Prélèvements',
                  key: 'samples_route',
                  component: () => <YearRoute element={SampleListView} />,
                }
              : undefined,
            hasPermission('createSample')
              ? {
                  path: '/prelevements/:year/nouveau',
                  label: 'Prélèvement',
                  key: 'new_sample_route',
                  component: () => <YearRoute element={SampleView} />,
                }
              : undefined,
            hasPermission('updateSample') || hasPermission('readSamples')
              ? {
                  path: '/prelevements/:year/:sampleId/*',
                  label: 'Prélèvement',
                  key: 'sample_route',
                  component: () => <YearRoute element={SampleView} />,
                }
              : undefined,
            {
              path: '/documents',
              label: 'Documents ressources',
              key: 'documents_route',
              component: DocumentListView,
            },
          ]
        : [
            {
              path: '/',
              label: 'Connexion',
              key: 'signin_route',
              component: HomeView,
            },
          ]),
    ].filter(isDefined);
  }, [isAuthenticated, hasPermission]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    userInfos,
    isAuthenticated,
    hasPermission,
    hasRole,
    hasNationalView,
    availableRoutes,
  };
};
