import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { genAuthUser } from 'shared/test/testFixtures';
import { applicationReducer, store } from 'src/store/store';
import Header from './Header';

describe('Header', () => {
  test('should display brand', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </Provider>
    );

    expect(
      screen.getByText(
        (t) =>
          t.includes('Plan de Surveillance') && t.includes('Plan de Contrôle')
      )
    ).toBeInTheDocument();
  });

  describe('when user is not authenticated', () => {
    test('should not display any navigation item', () => {
      const store = configureStore({
        reducer: applicationReducer,
        preloadedState: { auth: { authUser: undefined } },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.queryByText('Mes plans')).not.toBeInTheDocument();
      expect(screen.queryByText('Mes prélèvements')).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated with role "NationalCoordinator"', () => {
    test('should display only authorized items', () => {
      const store = configureStore({
        reducer: applicationReducer,
        preloadedState: {
          auth: { authUser: genAuthUser('NationalCoordinator') },
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Mes plans')).toBeInTheDocument();
      expect(screen.queryByText('Mes prélèvements')).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated with role "RegionalCoordinator"', () => {
    test('should display only authorized items', () => {
      const store = configureStore({
        reducer: applicationReducer,
        preloadedState: {
          auth: { authUser: genAuthUser('RegionalCoordinator') },
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Mes plans')).toBeInTheDocument();
      expect(screen.queryByText('Mes prélèvements')).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated with role "Sampler"', () => {
    test('should display only authorized items', () => {
      const store = configureStore({
        reducer: applicationReducer,
        preloadedState: {
          auth: { authUser: genAuthUser('Sampler') },
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.queryByText('Mes plans')).not.toBeInTheDocument();
      expect(screen.getByText('Mes prélèvements')).toBeInTheDocument();
    });
  });

  describe('when user is authenticated with role "Administrator"', () => {
    test('should display all items', () => {
      const store = configureStore({
        reducer: applicationReducer,
        preloadedState: {
          auth: { authUser: genAuthUser('Administrator') },
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Mes plans')).toBeInTheDocument();
      expect(screen.getByText('Mes prélèvements')).toBeInTheDocument();
    });
  });
});
