import { ReactElement, useMemo } from 'react';
import { User } from 'shared/schema/User/User';
import { UserPermission } from 'shared/schema/User/UserPermission';
import { UserRole, UserRolePermissions } from 'shared/schema/User/UserRole';
import { isDefined } from 'shared/utils/utils';
import { useAppSelector } from 'src/hooks/useStore';
import { useGetUserQuery } from 'src/services/user.service';
import HomeView from 'src/views/HomeView/HomeView';
import PrescriptionView from 'src/views/PrescriptionView/PrescriptionView';
import ProgrammingPlanListView from 'src/views/ProgrammingPlanListView/ProgrammingPlanListView';
import SampleListView from 'src/views/SampleListView/SampleListView';
import SampleView from 'src/views/SampleView/SampleView';
import SignInView from 'src/views/SignInView/SignInView';

export const useAuthentication = () => {
  const { authUser } = useAppSelector((state) => state.auth);

  const { data: user } = useGetUserQuery(authUser?.userId!, {
    skip: !authUser?.userId,
  });

  const isAuthenticated = useMemo(() => !!authUser?.userId, [authUser]);

  const hasPermission = useMemo(
    () => (permission: UserPermission) => {
      return (
        authUser?.userId &&
        user?.role &&
        UserRolePermissions[user.role ?? '']?.includes(permission)
      );
    },
    [authUser, user]
  );

  const hasRole = useMemo(
    () => (role: UserRole) => {
      return isAuthenticated && user && user?.role === role;
    },
    [user, isAuthenticated]
  );

  const hasNationalView = useMemo(() => {
    return isAuthenticated && user && user.region === null;
  }, [user, isAuthenticated]);

  const availableRoutes: {
    path: string;
    label: string;
    key: string;
    component: () => ReactElement;
  }[] = useMemo(() => {
    return [
      {
        path: '/',
        label: 'Accueil',
        key: 'home_route',
        component: HomeView,
      },
      ...(isAuthenticated
        ? [
            hasPermission('readPrescriptions')
              ? {
                  path: '/plans',
                  label: 'Plans',
                  key: 'programming_plans_route',
                  component: ProgrammingPlanListView,
                }
              : undefined,
            hasPermission('readPrescriptions')
              ? {
                  path: '/plans/:programmingPlanId/prescription',
                  label: 'Plans',
                  key: 'prescription_route',
                  component: PrescriptionView,
                }
              : undefined,
            hasPermission('readSamples')
              ? {
                  path: '/prelevements',
                  label: 'Prélèvements',
                  key: 'samples_route',
                  component: SampleListView,
                }
              : undefined,
            hasPermission('createSample')
              ? {
                  path: '/prelevements/nouveau',
                  label: 'Prélèvement',
                  key: 'new_sample_route',
                  component: SampleView,
                }
              : undefined,
            hasPermission('updateSample')
              ? {
                  path: '/prelevements/:sampleId',
                  label: 'Prélèvement',
                  key: 'sample_route',
                  component: SampleView,
                }
              : undefined,
          ]
        : [
            {
              path: '/connexion',
              label: 'Connexion',
              key: 'signin_route',
              component: SignInView,
            },
          ]),
    ].filter(isDefined);
  }, [isAuthenticated, hasPermission]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    user: user as User,
    isAuthenticated,
    hasPermission,
    hasRole,
    hasNationalView,
    availableRoutes,
  };
};
