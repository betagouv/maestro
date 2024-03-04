import React from 'react';
import './App.scss';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { store } from './store/store';
import { Provider } from 'react-redux';
import { useAuthentication } from 'src/hooks/useAuthentication';
import FetchInterceptor from 'src/components/FetchInterceptor/FetchInterceptor';
import { useAppSelector } from 'src/hooks/useStore';
import { startReactDsfr } from '@codegouvfr/react-dsfr/spa';
import Header from 'src/components/Header/Header';
import Footer from 'src/components/Footer/Footer';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';

declare module '@codegouvfr/react-dsfr/spa' {
  interface RegisterLink {
    Link: typeof Link;
  }
}

function AppWrapper() {
  startReactDsfr({ defaultColorScheme: 'light', Link });

  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

function App() {
  const { isAuthenticated, availableRoutes } = useAuthentication();
  const isSomeQueryPending = useAppSelector((state) =>
    Object.values(state.api.queries).some(
      (query) => query?.status === 'pending'
    )
  );

  FetchInterceptor();

  return (
    <React.Suspense fallback={<></>}>
      <Header />
      {isSomeQueryPending && <div>Loading...</div>}

      <main
        className={cx('fr-container', 'fr-pt-2w')}
        style={{ minHeight: 'calc(100vh - 440px)' }}
      >
        <Routes>
          {[
            ...availableRoutes.map((route) => (
              <Route
                path={route.path}
                element={<route.component />}
                key={route.key}
              />
            )),
            ,
            <Route path="/*" element={<Navigate replace to="/" />} />,
          ]}
        </Routes>
      </main>
      <Footer />
    </React.Suspense>
  );
}

export default AppWrapper;
