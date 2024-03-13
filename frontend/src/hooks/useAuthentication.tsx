import { ReactElement, useMemo } from 'react';
import { useAppSelector } from 'src/hooks/useStore';
import HomeView from 'src/views/HomeView/HomeView';
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
              path: '/prelevements',
              label: 'Prélèvements',
              key: 'sample_route',
              component: SampleListView,
            },
            {
              path: '/prelevements/nouveau',
              label: 'Prélèvement',
              key: 'sample_route',
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
