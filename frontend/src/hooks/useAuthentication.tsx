import { ReactElement, useMemo } from 'react';
import { useAppSelector } from 'src/hooks/useStore';
import HomeView from 'src/views/HomeView/HomeView';
import PrescriptionView from 'src/views/PrescriptionView/PrescriptionView';
import ProgrammingPlanListView from 'src/views/ProgrammingPlanListView/ProgrammingPlanListView';
import SampleListView from 'src/views/SampleListView/SampleListView';
import SampleView from 'src/views/SampleView/SampleView';
import SignInView from 'src/views/SignInView/SignInView';

export const useAuthentication = () => {
  const { authUser } = useAppSelector((state) => state.auth);

  const isAuthenticated = useMemo(() => !!authUser?.userId, [authUser]);

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
            {
              path: '/plans',
              label: 'Plans',
              key: 'programming_plans_route',
              component: ProgrammingPlanListView,
            },
            {
              path: '/plans/:programmingPlanId/prescription',
              label: 'Plans',
              key: 'prescription_route',
              component: PrescriptionView,
            },
            {
              path: '/prelevements',
              label: 'Prélèvements',
              key: 'samples_route',
              component: SampleListView,
            },
            {
              path: '/prelevements/nouveau',
              label: 'Prélèvement',
              key: 'new_sample_route',
              component: SampleView,
            },
            {
              path: '/prelevements/:sampleId',
              label: 'Prélèvement',
              key: 'sample_route',
              component: SampleView,
            },
          ]
        : [
            {
              path: '/connexion',
              label: 'Connexion',
              key: 'signin_route',
              component: SignInView,
            },
          ]),
    ];
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    userId: authUser?.userId,
    isAuthenticated,
    availableRoutes,
  };
};
