import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createMuiDsfrThemeProvider } from '@codegouvfr/react-dsfr/mui';
import { startReactDsfr } from '@codegouvfr/react-dsfr/spa';
import clsx from 'clsx';
import React from 'react';
import { Provider } from 'react-redux';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import FetchInterceptor from 'src/components/FetchInterceptor/FetchInterceptor';
import Footer from 'src/components/Footer/Footer';
import Header from 'src/components/Header/Header';
import ScrollToTop from 'src/components/ScrollToTop/ScrollToTop';
import { useAuthentication } from 'src/hooks/useAuthentication';
import useMatomoTagManager from 'src/hooks/useMatomoTagManager';
import { useOnLine } from 'src/hooks/useOnLine';
import { useAppSelector } from 'src/hooks/useStore';
import LoginCallbackView from 'src/views/LoginCallbackView/LoginCallbackView';
import LogoutCallbackView from 'src/views/LogoutCallbackView/LogoutCallbackView';
import './App.scss';
import { store } from './store/store';

declare module '@codegouvfr/react-dsfr/spa' {
  interface RegisterLink {
    Link: typeof Link;
  }
}
startReactDsfr({ defaultColorScheme: 'light', Link });

function AppWrapper() {
  const { MuiDsfrThemeProvider } = createMuiDsfrThemeProvider({
    augmentMuiTheme: ({ nonAugmentedMuiTheme }) => ({
      ...nonAugmentedMuiTheme
    })
  });

  useMatomoTagManager();

  return (
    <MuiDsfrThemeProvider>
      <Provider store={store}>
        <ScrollToTop />
        <App />
      </Provider>
    </MuiDsfrThemeProvider>
  );
}

function App() {
  const { availableRoutes } = useAuthentication();
  const isSomeQueryPending = useAppSelector((state) =>
    Object.values(state.api.queries).some(
      (query) => query?.status === 'pending'
    )
  );
  const { isOnline } = useOnLine();

  FetchInterceptor();

  return (
    <React.Suspense fallback={<></>}>
      <Header />
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
            Votre connexion Internet est instable. Les données renseignées sont
            conservées jusqu’au rétablissement de la connexion.
          </div>
        </div>
      )}

      <main style={{ minHeight: 'calc(100vh - 440px)' }}>
        <Routes>
          {[
            ...availableRoutes.map((route) => (
              <Route
                path={route.path}
                element={<route.component />}
                key={route.key}
              />
            )),
            <Route
              path="/login-callback"
              element={<LoginCallbackView />}
              key="login_callback_route"
            />,
            <Route
              path="/logout-callback"
              element={<LogoutCallbackView />}
              key="logout_callback_route"
            />,
            <Route
              path="/*"
              element={<Navigate replace to="/" />}
              key="redirection_route"
            />
          ]}
        </Routes>
      </main>
      <Footer />
    </React.Suspense>
  );
}

export default AppWrapper;
