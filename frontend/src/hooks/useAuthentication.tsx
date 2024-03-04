import { ReactElement, useMemo } from 'react';
import { useAppSelector } from 'src/hooks/useStore';
import HomeView from 'src/views/HomeView/HomeView';

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
    ];
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    userId: authUser?.userId,
    isAuthenticated,
    availableRoutes,
  };
};
