import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createMuiDsfrThemeProvider } from '@codegouvfr/react-dsfr/mui';
import { startReactDsfr } from '@codegouvfr/react-dsfr/spa';
import clsx from 'clsx';
import { AppRouteKeys } from 'maestro-shared/schema/AppRouteLinks/AppRouteLinks';
import React, { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { Link, Route, Routes } from 'react-router';
import FetchInterceptor from 'src/components/FetchInterceptor/FetchInterceptor';
import Footer from 'src/components/Footer/Footer';
import Header from 'src/components/Header/Header';
import ScrollToTop from 'src/components/ScrollToTop/ScrollToTop';
import { useAuthentication } from 'src/hooks/useAuthentication';
import useMatomoTagManager from 'src/hooks/useMatomoTagManager';
import { useOnLine } from 'src/hooks/useOnLine';
import { useAppSelector } from 'src/hooks/useStore';
import './App.scss';
import { AppRouteComponents } from './AppRouteComponents';
import { AppRoutes, RedirectRoute } from './AppRoutes';
import {
  MascaradeContext,
  useMascarade
} from './components/Mascarade/MascaradeContext';
import { MascaradeNotice } from './components/Mascarade/MascaradeNotice';
import { RootNotice } from './components/RootNotice/RootNotice';
import { apiClient, ApiClientContext } from './services/apiClient';
import { store } from './store/store';

declare module '@codegouvfr/react-dsfr/spa' {
  interface RegisterLink {
    Link: typeof Link;
  }
}
startReactDsfr({ defaultColorScheme: 'light', Link });

export const { MuiDsfrThemeProvider } = createMuiDsfrThemeProvider({
  augmentMuiTheme: ({ nonAugmentedMuiTheme }) => ({
    ...nonAugmentedMuiTheme
  })
});

function AppWrapper() {
  useMatomoTagManager();

  return (
    <MuiDsfrThemeProvider>
      <Provider store={store}>
        <ApiClientContext.Provider value={apiClient}>
          <ScrollToTop />
          <App />
        </ApiClientContext.Provider>
      </Provider>
    </MuiDsfrThemeProvider>
  );
}

function App() {
  const { availableRoutes, isAuthenticated } = useAuthentication();
  const isSomeQueryPending = useAppSelector((state) =>
    Object.values(state.api.queries).some(
      (query) => query?.status === 'pending'
    )
  );
  const { isOnline } = useOnLine();

  FetchInterceptor();

  const { mascaradeUserId, setMascaradeUserId } = useMascarade();

  return (
    <React.Suspense fallback={<></>}>
      <MascaradeContext.Provider
        value={{ mascaradeUserId, setMascaradeUserId }}
      >
        <MascaradeNotice />
        <Header />
        <RootNotice />
        {isSomeQueryPending && (
          <div className="toast">Chargement en cours...</div>
        )}
        {!isOnline && (
          <div className={cx('fr-badge--error')}>
            <div
              className={clsx(
                cx('fr-container', 'fr-py-2w'),
                'd-flex-align-center'
              )}
            >
              <span className={cx('fr-icon-link-unlink', 'fr-mr-1w')}></span>
              Votre connexion Internet est instable. Les données renseignées
              sont conservées jusqu’au rétablissement de la connexion.
            </div>
          </div>
        )}

        <main
          className={clsx({ 'main-nologged': !isAuthenticated })}
          style={{
            minHeight: 'calc(100vh - 440px)'
          }}
        >
          <Routes>
            {[
              ...availableRoutes.map((routeKey) => {
                const route = {
                  ...AppRoutes[routeKey as AppRouteKeys],
                  component: AppRouteComponents[
                    routeKey as AppRouteKeys
                  ] as () => ReactElement
                };
                return (
                  <Route
                    path={route.path}
                    element={<route.component />}
                    key={route.key}
                  />
                );
              }),
              <Route
                path="/*"
                element={<RedirectRoute />}
                key="redirection_route"
              />
            ]}
          </Routes>
        </main>
        <Footer />
      </MascaradeContext.Provider>
    </React.Suspense>
  );
}

export default AppWrapper;
