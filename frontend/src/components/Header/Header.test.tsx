import { configureStore, Store } from '@reduxjs/toolkit';
import { render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ProgrammingPlanStatusLabels } from 'shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { genAuthUser, genUser } from 'shared/test/testFixtures';
import { applicationMiddleware, applicationReducer } from 'src/store/store';
import { mockRequests } from '../../../test/requestUtils.test';
import Header from './Header';

describe('Header', () => {
  const authUser = genAuthUser();
  let store: Store;

  beforeEach(() => {
    fetchMock.resetMocks();
    store = configureStore({
      reducer: applicationReducer,
      middleware: applicationMiddleware,
      preloadedState: {
        auth: { authUser },
      },
    });
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

      expect(
        screen.queryByText(ProgrammingPlanStatusLabels['Validated'])
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Prélèvements')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Documents ressources')
      ).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated with role "NationalCoordinator"', () => {
    const user = {
      ...genUser('NationalCoordinator'),
      id: authUser.userId,
    };

    test('should display only authorized items', async () => {
      mockRequests([
        {
          pathname: `/api/users/${user.id}/infos`,
          response: { body: JSON.stringify(user) },
        },
      ]);

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </Provider>
      );

      const navigation = screen.getByRole('navigation');

      expect(
        await within(navigation).findByText(
          ProgrammingPlanStatusLabels['Validated']
        )
      ).toBeInTheDocument();
      expect(
        within(navigation).queryByText('Prélèvements')
      ).not.toBeInTheDocument();
      expect(
        await within(navigation).findByText('Documents ressources')
      ).toBeInTheDocument();
    });
  });

  describe('when user is authenticated with role "RegionalCoordinator"', () => {
    const user = {
      ...genUser('RegionalCoordinator'),
      id: authUser.userId,
    };

    beforeEach(() => {
      mockRequests([
        {
          pathname: `/api/users/${user.id}/infos`,
          response: { body: JSON.stringify(user) },
        },
      ]);
    });

    test('should display only authorized items', async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </Provider>
      );

      const navigation = screen.getByRole('navigation');

      expect(
        await within(navigation).findByText(
          ProgrammingPlanStatusLabels['Validated']
        )
      ).toBeInTheDocument();
      expect(
        within(navigation).queryByText('Prélèvements')
      ).not.toBeInTheDocument();
      expect(
        await within(navigation).findByText('Documents ressources')
      ).toBeInTheDocument();
    });
  });

  describe('when user is authenticated with role "Sampler"', () => {
    const user = {
      ...genUser('Sampler'),
      id: authUser.userId,
    };

    beforeEach(() => {
      mockRequests([
        {
          pathname: `/api/users/${user.id}/infos`,
          response: { body: JSON.stringify(user) },
        },
      ]);
    });

    test('should display only authorized items', async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </Provider>
      );

      const navigation = screen.getByRole('navigation');

      expect(
        await within(navigation).findByText(
          ProgrammingPlanStatusLabels['Validated']
        )
      ).toBeInTheDocument();
      expect(
        await within(navigation).findByText('Prélèvements')
      ).toBeInTheDocument();
      expect(
        await within(navigation).findByText('Documents ressources')
      ).toBeInTheDocument();
    });
  });

  describe('when user is authenticated with role "Administrator"', () => {
    const user = {
      ...genUser('Administrator'),
      id: authUser.userId,
    };

    beforeEach(() => {
      mockRequests([
        {
          pathname: `/api/users/${user.id}/infos`,
          response: { body: JSON.stringify(user) },
        },
      ]);
    });

    test('should display all items', async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        </Provider>
      );

      const navigation = screen.getByRole('navigation');

      expect(
        await within(navigation).findByText(
          ProgrammingPlanStatusLabels['Validated']
        )
      ).toBeInTheDocument();
      expect(
        await within(navigation).findByText('Prélèvements')
      ).toBeInTheDocument();
      expect(
        await within(navigation).findByText('Documents ressources')
      ).toBeInTheDocument();
    });
  });
});
